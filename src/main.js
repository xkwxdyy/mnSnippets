
JSB.newAddon = function (mainPath) {

  JSB.require('webviewController');
  JSB.require('utils')
  /** @return {MNSnippetsClass} */
  const getMNSnippetsClass = ()=>self  
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNSnippets_config")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey("MNSnippets_promptNames")
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNSnippets_currentPrompt');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNSnippets_toolbar');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNSnippets_prompts');
    // NSUserDefaults.standardUserDefaults().removeObjectForKey('MNSnippets_config');
  // let test = NSUserDefaults.standardUserDefaults().objectForKey('MNSnippets_prompts')
  let defaultPrompts = {
      Translate:                      {title: "文本标题",context:"文本内容"}
  }
  let prompts = getLocalDataByKeyDefault('MNSnippets_prompts',defaultPrompts)
  let config = getMNSnippetsConfig()
  let currentPrompt = config.currentPrompt
  let observers = []
  // var temSender;

  var MNSnippetsClass = JSB.defineClass(
    'MNSnippets : JSExtension',
    { /* Instance members */
      sceneWillConnect: function () { //Window initialize
        self.isNewWindow = false;
        self.watchMode = false;
        self.textSelected = ""
        self.textProcessed = false;
        self.dateGetText = Date.now();
        self.dateNow = Date.now();
        self.rect = '{{0, 0}, {10, 10}}';
        self.arrow = 1;
        self.isFirst = true;
        self.linkDetected = false
        addObserver(self, 'onPopupMenuOnSelection:', 'PopupMenuOnSelection')
        addObserver(self, 'onPopupMenuOnNote:', 'PopupMenuOnNote')
        addObserver(self, 'onClosePopupMenuOnNote:', 'ClosePopupMenuOnNote')
        addObserver(self, 'onClosePopupMenuOnSelection:', 'ClosePopupMenuOnSelection')
        addObserver(self, 'onProcessNewExcerpt:', 'ProcessNewExcerpt')
        addObserver(self, 'onChatOnNote:', 'chatOnNote')
        addObserver(self, 'onChatOnQuestion:', 'chatOnQuestion')
      },

      sceneDidDisconnect: function () { // Window disconnect

      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: function (notebookid) {
      try {
        

        let self = getMNSnippetsClass()
        self.appInstance = Application.sharedInstance();
        self.studyController = Application.sharedInstance().studyController(self.window)
        // self.addonController = browserController.new();
        if (!self.addonController) {
          self.addonController = snippetsController.new();
        }
        self.addonController.mainPath = mainPath;
        self.addonController.config = config
        self.addonController.prompts = prompts;
        if (!self.addSubview) {
          self.addSubview = true
          studyController().view.addSubview(self.addonController.view);
        }

        self.studyController.refreshAddonCommands();
        self.addonController.view.hidden = true;
        self.addonController.notebookid = notebookid

        if (self.addonController.promptNames.includes(config.currentPrompt)) {
          self.addonController.currentPrompt = currentPrompt
        }
        NSTimer.scheduledTimerWithTimeInterval(0.2, false, function () {
          self.studyController(self.window).becomeFirstResponder(); //For dismiss keyboard on iOS
        });
      } catch (error) {
        
      }
      },
      notebookWillClose: function (notebookid) {
        // self.addonController.homePage()
        self.addonController.view.removeFromSuperview()
        // self.appInstance.studyController(self.window).view.remov(self.addonController.view);
        self.watchMode = false;
        self.addSubview = false;
        self.textSelected = '';
        // removeObservers(self,['PopupMenuOnSelection','ClosePopupMenuOnSelection','PopupMenuOnNote','ClosePopupMenuOnNote'])
      },

      documentDidOpen: function (docmd5) {
      },

      documentWillClose: function (docmd5) {
      },

      controllerWillLayoutSubviews: function (controller) {
        if (controller !== self.appInstance.studyController(self.window)) {
          return;
        };
        if (!self.addonController.view.hidden) {
          let studyFrame = Application.sharedInstance().studyController(self.window).view.bounds
          if (self.addonController.miniMode) {
            let oldFrame = self.addonController.view.frame
            if (oldFrame.x < studyFrame.width*0.5) {
            // self.addonController.view.frame = self.addonController.currentFrame
              self.addonController.view.frame = { x: 0, y: oldFrame.y, width: 40, height: 40 }
            } else {
              self.addonController.view.frame = { x: studyFrame.width - 40, y: oldFrame.y, width: 40, height: 40 }
            }
          } else if (self.addonController.custom) {
            self.addonController.setSplitScreenFrame(self.addonController.customMode)
          }else{
            let currentFrame = self.addonController.currentFrame
            if (currentFrame.x+currentFrame.width*0.5 >= studyFrame.width) {
              currentFrame.x = studyFrame.width-currentFrame.width*0.5              
            }
            if (currentFrame.y >= studyFrame.height) {
              currentFrame.y = studyFrame.height-20              
            }
            self.addonController.view.frame = currentFrame
            self.addonController.currentFrame = currentFrame
          }
        }
      },

      queryAddonCommandStatus: function () {
        return {
          image: 'logo.png',
          object: self,
          selector: 'toggleAddon:',
          checked: self.addonController.config.autoAction
        };
      },

      onPopupMenuOnSelection: function (sender) { // Selecting text on pdf or epub
        let self = getMNSnippetsClass()
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
        self.textSelected = sender.userInfo.documentController.selectionText;
        // showHUD(self.textSelected)

        self.addonController.selectedText = self.textSelected
        self.dateGetText = Date.now();
        self.textProcessed = false
        self.onPopupMenuOnSelectionTime = Date.now()
        let studyFrame = studyController().view.frame
        let winFrame = parseWinRect(sender.userInfo.winRect)
        let xOffset = sender.userInfo.arrow===1 ? 20: -50
        let yOffset = sender.userInfo.arrow===1 ? -50: -40
        winFrame.x = winFrame.x+xOffset-studyFrame.x
        winFrame.y = winFrame.y+yOffset
        if (winFrame.x < 0) {
          winFrame.x = 0
        }
        if (winFrame.x > studyFrame.width-40) {
          winFrame.x = studyFrame.width-40
        }
        self.addonController.currentNoteId = undefined
      },
      onClosePopupMenuOnSelection: function (sender) {
        let self = getMNSnippetsClass()
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window

        self.onClosePopupMenuOnSelectionTime = Date.now()
      },
      onProcessNewExcerpt: function (sender) {
        let self = getMNSnippetsClass()
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
      try {
        

        let note = getNoteById(sender.userInfo.noteid)
        let currentNoteId = note.noteId
        self.notShow = false
        self.noteid = currentNoteId
        if (note.excerptPic) {
          return
        }
      } catch (error) {
        showHUD(error)
      }
      },
      onPopupMenuOnNote: function (sender) { // Clicking note
        let self = getMNSnippetsClass()

        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window
        let note = sender.userInfo.note
        let currentNoteId = note.noteId
        self.noteid = currentNoteId
        self.onPopupMenuOnNoteTime = Date.now()
      try {
        let studyFrame = studyController().view.frame
        let winFrame = parseWinRect(sender.userInfo.winRect)
        let yOffset = winFrame.width===10?50:25
        let xOffset = winFrame.width===10?winFrame.width+20:winFrame.width
        let dynamicFrame = genFrame(winFrame.x+xOffset-studyFrame.x, winFrame.y-yOffset, 40, 40)
        if (dynamicFrame.y < 10) {
          dynamicFrame.y = 10
        }
        if (dynamicFrame.x > studyFrame.width-40) {
          dynamicFrame.x = studyFrame.width-40
        }
        self.addonController.currentNoteId = currentNoteId
      } catch (error) {
        showHUD("Error in onPopupMenuOnNote: "+error)
      }
      },
      onClosePopupMenuOnNote: function (sender) {
        let self = getMNSnippetsClass()
        if (!self.appInstance.checkNotifySenderInWindow(sender, self.window)) return; // Don't process message from other window

        self.onClosePopupMenuOnNoteTime = Date.now()
        if (self.noteid === sender.userInfo.noteid && Date.now()-self.onPopupMenuOnNoteTime < 500) {
          self.notShow = true
        }
      },
      toggleAddon: function (sender) {
      // try {
        

        if (!self.addonBar) {
          self.addonBar = sender.superview.superview
          self.addonController.addonBar = self.addonBar
        }
        if (self.addonController.view.hidden) {
          if (self.isFirst) {
            // Application.sharedInstance().showHUD("first",self.window,2)
            let buttonFrame = self.addonBar.frame
            let width = 300
            if (buttonFrame.x <= 100) {
              self.addonController.view.frame = {x:buttonFrame.x+40,y:buttonFrame.y,width:width,height:400}
            }else{
              self.addonController.view.frame = {x:buttonFrame.x-width,y:buttonFrame.y,width:width,height:400}
            }
            self.addonController.currentFrame = self.addonController.view.frame
            self.isFirst = false;
          }
          self.addonController.show(self.addonBar.frame)
          // self.addonController.view.hidden = false
        } else {
            // self.addonController.view.hidden = true;
          if (self.addonController.miniMode) {
            let preFrame = self.addonController.view.frame
            self.addonController.view.hidden = true
            self.addonController.showAllButton()
            let studyFrame = Application.sharedInstance().studyController(self.window).view.bounds
            if (self.addonController.view.frame.x < studyFrame.width*0.5) {
              self.addonController.lastFrame.x = 0
            }else{
              self.addonController.lastFrame.x = studyFrame.width-self.addonController.lastFrame.width
            }
            self.addonController.view.frame  = self.addonController.lastFrame
            self.addonController.currentFrame = self.addonController.lastFrame
            self.addonController.show(preFrame)
          }else{
            self.addonController.hide(self.addonBar.frame)
          }
          self.watchMode = false;
          self.appInstance.studyController(self.window).refreshAddonCommands();
          return;
        }
        NSTimer.scheduledTimerWithTimeInterval(0.2, false, function () {
          self.appInstance.studyController(self.window).becomeFirstResponder(); // For dismiss keyboard on iOS
        });

        if (!self.addonController.view.window) return;
        if (self.viewTimer) self.viewTimer.invalidate();
      // } catch (error) {
      //   showHUD(error)
      // }
      },
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: function () {
        removeLocalDataByKey("MNSnippets_prompts")
        removeLocalDataByKey('MNSnippets_config');
      },

      applicationWillEnterForeground: function () {
      },

      applicationDidEnterBackground: function () {
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );

  MNSnippetsClass.prototype.layoutAddonController = function (rectStr, arrowNum) {

    this.rect = rectStr || this.rect;
    this.arrow = arrowNum || this.arrow;
    var x, y
    w = (this.appInstance.osType !== 1) ? 419 : 365, // this.addonController.view.frame.width
      h = 500, // this.addonController.view.frame.height
      fontSize = 15,
      margin = 10,
      padding = 20,
      frame = this.appInstance.studyController(this.window).view.bounds,
      W = frame.width,
      H = frame.height,
      rectArr = this.rect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(','),
      X = Number(rectArr[0]),
      Y = Number(rectArr[1]),
      studyMode = this.appInstance.studyController(this.window).studyMode,
      contextMenuWidth = studyMode === 0 ? 225 : 435,
      contextMenuHeight = 35,
      textMenuPadding = 40;

    // this.addonController.view.frame.x
    if (w >= contextMenuWidth) {
      if (X - w / 2 - margin <= 0) {
        x = margin;
      } else if (X + w / 2 + margin >= W) {
        x = W - margin - w;
      } else {
        x = X - w / 2;
      }
    } else {
      if (X - contextMenuWidth / 2 - margin <= 0) {
        x = margin + contextMenuWidth / 2 - w / 2;
      } else if (X + contextMenuWidth / 2 + margin >= W) {
        x = W - margin - contextMenuWidth / 2 - w / 2;
      } else {
        x = X - w / 2;
      }
    }

    // this.addonController.view.frame.[y, height]
    if (this.arrow === 1) {
      let upperBlankHeight = Y - textMenuPadding - fontSize - padding,
        lowerBlankHeight = H - Y - contextMenuHeight - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
    // this.appInstance.showHUD('x:'+x+';y:'+Y,this.window,2)
      }
    } else {
      let upperBlankHeight = Y - textMenuPadding - contextMenuHeight - padding,
        lowerBlankHeight = H - Y - fontSize - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
      }
    }
    this.addonController.view.frame = { x: x, y: y, width: w, height: h };
    this.addonController.currentFrame = { x: x, y: y, width: w, height: h };

  };
  MNSnippetsClass.prototype.customLayoutAddonController = function (rectStr, arrowNum, custom = false) {

    this.rect = rectStr || this.rect;
    this.arrow = arrowNum || this.arrow;
    var x, y
      w = (this.appInstance.osType !== 1) ? 419 : 365, // this.addonController.view.frame.width
      h = 450, // this.addonController.view.frame.height
      fontSize = 15,
      margin = 10,
      padding = 20,
      frame = this.appInstance.studyController(this.window).view.bounds,
      W = frame.width,
      H = frame.height,
      rectArr = this.rect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(','),
      X = Number(rectArr[0]),
      Y = Number(rectArr[1]),
      studyMode = this.appInstance.studyController(this.window).studyMode,
      contextMenuWidth = studyMode === 0 ? 225 : 435,
      contextMenuHeight = 35,
      textMenuPadding = 40;

    // this.addonController.view.frame.x
    if (w >= contextMenuWidth) {
      if (X - w / 2 - margin <= 0) {
        x = margin;
      } else if (X + w / 2 + margin >= W) {
        x = W - margin - w;
      } else {
        x = X - w / 2;
      }
    } else {
      if (X - contextMenuWidth / 2 - margin <= 0) {
        x = margin + contextMenuWidth / 2 - w / 2;
      } else if (X + contextMenuWidth / 2 + margin >= W) {
        x = W - margin - contextMenuWidth / 2 - w / 2;
      } else {
        x = X - w / 2;
      }
    }

    // this.addonController.view.frame.[y, height]
    if (this.arrow === 1) {
      let upperBlankHeight = Y - textMenuPadding - fontSize - padding,
        lowerBlankHeight = H - Y - contextMenuHeight - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
      }
    } else {
      let upperBlankHeight = Y - textMenuPadding - contextMenuHeight - padding,
        lowerBlankHeight = H - Y - fontSize - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
      }
    }
    this.addonController.view.frame = { x: x, y: y + 50, width: w, height: h };
    this.addonController.currentFrame = { x: x, y: y + 50 , width: w, height: h };
  };
  MNSnippetsClass.prototype.getNoteList = function (note) {
    let noteList = []
    if (note.noteTitle) {
      noteList.push(note.noteTitle)
    }
    if (note.excerptText && !note.excerptPic) {
      noteList.push(note.excerptText)
    }
    return noteList.concat(note.comments.filter(comment=>comment.type="TextNote").map(comment=>comment.text))
  };
  return MNSnippetsClass;
};