JSB.require('utils');
// JSB.require('base64')
/** @return {snippetsController} */
const getSnippetsController = ()=>self
var snippetsController = JSB.defineClass('snippetsController : UIViewController', {
  viewDidLoad: function() {
    let self = getSnippetsController()
    self.init()
    self.view.frame = {x:50,y:50,width:(self.appInstance.osType !== 1) ? 419 : 365,height:450}
    self.lastFrame = self.view.frame;
    self.currentFrame = self.view.frame
    self.title = "main"
    self.moveDate = Date.now()
    self.compactView = false
    self.color = [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]
    self.view.layer.shadowOffset = {width: 0, height: 0};
    self.view.layer.shadowRadius = 15;
    self.view.layer.shadowOpacity = 0.5;
    self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);
    self.view.layer.cornerRadius = 11
    self.view.layer.opacity = 1.0
    self.view.layer.borderColor = hexColorAlpha("#9bb2d6",0.8)
    self.view.layer.borderWidth = 0
    self.autoAction = self.config.autoAction
    self.onSelection = self.config.onSelection
    self.onNote = self.config.onNote
    self.onNewExcerpt = self.config.onNewExcerpt
    self.notifyLoc = self.config.notifyLoc
    self.highlightColor = UIColor.blendedColor( hexColorAlpha("#2c4d81",0.8),
      self.appInstance.defaultTextColor,
      0.8
    );
    if (!self.config.delay) {
      self.config.delay = 0
    }
    if (!self.config.colorConfig) {
      self.config.colorConfig = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    }
    if (self.config.ignoreShortText == undefined) {
      self.config.ignoreShortText = false
    }

    try {

    if (!self.settingView) {
      self.createSettingView()
    }
    self.settingViewLayout()
    
      self.setButtonText(self.config.promptNames,self.config.currentPrompt)
      self.setTextview(self.config.currentPrompt)
      self.settingView.hidden = false
    } catch (error) {
      showHUD("Error in viewDidLoad: "+error)
      
    }

    self.createButton("closeButton","closeButtonTapped:")
    self.closeButton.setTitleForState('✖️', 0);
    self.closeButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("maxButton","maxButtonTapped:")
    self.maxButton.setTitleForState('➕', 0);
    self.maxButton.titleLabel.font = UIFont.systemFontOfSize(10);

    self.createButton("moveButton")


    self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
    self.moveButton.addGestureRecognizer(self.moveGesture)
    self.moveGesture.view.hidden = false
    self.moveGesture.addTargetAction(self,"onMoveGesture:")

    self.resizeGesture = new UIPanGestureRecognizer(self,"onResizeGesture:")
    self.saveButton.addGestureRecognizer(self.resizeGesture)
    self.resizeGesture.view.hidden = false
    self.resizeGesture.addTargetAction(self,"onResizeGesture:")
    // self.settingController.view.hidden = false
  },
  viewWillAppear: function(animated) {
  },
  viewWillDisappear: function(animated) {
  },
  viewWillLayoutSubviews: function() {
    let self = getSnippetsController()
    let buttonHeight = 25
    // self.view.frame = self.currentFrame
    var viewFrame = self.view.bounds;
    var width    = viewFrame.width
    var height   = viewFrame.height
    self.closeButton.frame = genFrame(width-18,0,18,18)
    self.maxButton.frame = genFrame(width-43,0,18,18)
    self.moveButton.frame = {  x: width*0.5-75,  y: 0,  width: 150,  height: 15,};
    height = height-36
    self.settingViewLayout()
    self.refreshLayout()

  },
  changeOpacityTo:function (opacity) {
    self.view.layer.opacity = opacity
  },
  openSettingView:function () {
    let self = getSnippetsController()
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    // self.settingController.view.hidden = false
    if (!self.settingView) {
      self.createSettingView()
    }else{
    }
    self.settingViewLayout()
    
    try {
      self.setButtonText(self.config.promptNames,self.config.currentPrompt)
      self.setTextview(self.config.currentPrompt)
      self.settingView.hidden = false
    } catch (error) {
      showHUD(error)
      
    }

  },
  resetConfig: function (button) {
    let self = getSnippetsController()
    let clickDate = Date.now()
    if (button.clickDate && clickDate-button.clickDate<300) {


      let defaultPrompts = {
          Translate:                      {title: "文本标题",context:"文本内容"}
      }
      self.prompts = defaultPrompts
      self.config.promptNames = Object.keys(self.prompts)
      self.config.currentPrompt = self.config.promptNames[0]
      self.setButtonText(self.config.promptNames,self.config.currentPrompt)
      self.setTextview(self.config.currentPrompt)
      setLocalDataByKey(self.config,'MNSnippets_config')
      setLocalDataByKey(self.prompts,"MNSnippets_prompts")
      return
    }else{
      button.clickDate = clickDate
      showHUD("双击重置")
    }
  },

  toggleWindowLocation: function () {
    if (self.view.popoverController) {self.view.popoverController.dismissPopoverAnimated(true);}
    switch (self.config.notifyLoc) {
      case 1:
        self.config.notifyLoc = 0
        self.windowLocationButton.setTitleForState("Notification: Left",0)
        self.notifyController.locationButton.setTitleForState("Left",0)
        break;
      case 0:
        self.config.notifyLoc = 1
        self.windowLocationButton.setTitleForState("Notification: Right",0)
        self.notifyController.locationButton.setTitleForState("Right",0)
        break;
      default:
        break;
    }
    // self.notifyController.config = self.config
    setLocalDataByKey(self.config,'MNSnippets_config')
  },
  closeButtonTapped: function() {
    // self.view.hidden = true;
    // self.custom = false;
    // self.dynamic = true;
    if (self.addonBar) {
      self.hide(self.addonBar.frame)
    }else{
      self.hide()
    }
    self.searchedText = ""
  },
  maxButtonTapped: function() {
    if (self.customMode === "full") {
      self.customMode = "none"
      self.custom = false;
      self.hideAllButton()
      UIView.animateWithDurationAnimationsCompletion(0.3,()=>{
        self.view.frame = self.lastFrame
        self.currentFrame = self.lastFrame
      },
      ()=>{
        self.showAllButton()
      
      })
      return
    }
    const frame = Application.sharedInstance().studyController(self.view.window).view.bounds
    self.lastFrame = self.view.frame
    self.customMode = "full"
    self.custom = true;
    self.dynamic = false;
    self.hideAllButton()


    UIView.animateWithDurationAnimationsCompletion(0.3,()=>{
      self.view.frame = {x:40,y:50,width:frame.width-80,height:frame.height-70}
      self.currentFrame = {x:40,y:50,width:frame.width-80,height:frame.height-70}
    },
    ()=>{
      self.showAllButton()
    })
  },
  onMoveGesture:function (gesture) {
    self.dynamic = false;
    let locationToMN = gesture.locationInView(self.appInstance.studyController(self.view.window).view)
    if (!self.locationToButton || !self.miniMode && (Date.now() - self.moveDate) > 100) {
      let translation = gesture.translationInView(self.appInstance.studyController(self.view.window).view)
      let locationToBrowser = gesture.locationInView(self.view)
      let locationToButton = gesture.locationInView(gesture.view)
      let buttonFrame = self.moveButton.frame
      let newY = locationToButton.y-translation.y 
      let newX = locationToButton.x-translation.x
      if (gesture.state !== 3 && (newY<buttonFrame.height+5 && newY>-5 && newX<buttonFrame.width+5 && newX>-5 && Math.abs(translation.y)<20 && Math.abs(translation.x)<20)) {
        self.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
        self.locationToButton = {x:newX,y:newY}
      }
      // if ((newY<buttonFrame.height && newY>0 && newX<buttonFrame.width && newX>0 && Math.abs(translation.y)<20 && Math.abs(translation.x)<20) || !self.locationToBrowser) {

      // }
    }
    self.moveDate = Date.now()
    // let location = {x:locationToMN.x - self.locationToBrowser.x,y:locationToMN.y -self.locationToBrowser.y}
    let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}

    let frame = self.view.frame
    var viewFrame = self.view.bounds;
    let studyFrame = self.appInstance.studyController(self.view.window).view.bounds
    let y = location.y
    if (y<=0) {
      y = 0
    }
    if (y>=studyFrame.height-15) {
      y = studyFrame.height-15
    }
    let x = location.x
    
    if (self.custom) {
      self.customMode = "None"
      UIView.animateWithDurationAnimations(0.2,()=>{
        self.view.frame = genFrame(x,y,self.lastFrame.width,self.lastFrame.height)
        self.currentFrame  = self.view.frame
      })
    }else{
      self.view.frame = genFrame(x,y,frame.width,frame.height)
      self.currentFrame  = self.view.frame
    }
    self.custom = false;
  },
  onResizeGesture:function (gesture) {
    self.custom = false;
    self.customMode = "none"
    let baseframe = gesture.view.frame
    let locationToBrowser = gesture.locationInView(self.view)
    let frame = self.view.frame
    let width = locationToBrowser.x+baseframe.width*0.5
    let height = locationToBrowser.y+baseframe.height*0.5
    if (width <= 300) {
      width = 300
    }
    if (height <= 100) {
      height = 100
    }
    if (height <= 250) {
      self.compactView = true
    }else if (height <= 400) {
      self.compactView = false
      height = 400
    }
    //  self.view.frame = {x:frame.x,y:frame.y,width:frame.width+translationX,height:frame.height+translationY}
    self.view.frame = {x:frame.x,y:frame.y,width:width,height:height}
    self.currentFrame  = self.view.frame
  },
  pasteButtonTapped: function (params) {
    let text = UIPasteboard.generalPasteboard().string
    if (text) {
      self.contextInput.text = text
    }
    // self.pasteButton.backgroundColor = hexColorAlpha("#457bd3",0.8)
    // self.copyButton.backgroundColor = hexColorAlpha("#9bb2d6",0.8)
    // self.contextInput.hidden = true
  },
  copyButtonTapped: function (params) {
    copy(self.contextInput.text)
    showHUD("文本已复制")
    // self.pasteButton.backgroundColor = hexColorAlpha("#9bb2d6",0.8)
    // self.copyButton.backgroundColor = hexColorAlpha("#457bd3",0.8)
    // self.contextInput.hidden = false
  },
  configSaveTapped: function (params) {
    let self = getSnippetsController()
    try {
      let func = self.prompts[self.config.currentPrompt].func
      let title = self.titleInput.text ? self.titleInput.text : ""
      let context = self.contextInput.text ? self.contextInput.text : ""

      let config = {title:title,context:context}
      self.prompts[self.config.currentPrompt] = config
      self.setButtonText(self.config.promptNames,self.config.currentPrompt)
      setLocalDataByKey(self.prompts,"MNSnippets_prompts")
      showHUD("Save snippet: "+self.prompts[self.config.currentPrompt].title)
    } catch (error) {
      showHUD(error, self.view.window, 2);
    }
    // self.appInstance.studyController(self.view.window).focusNoteInMindMapById("FA871E6D-A175-4D1E-8568-63510CA82E42")
  },
  clearButtonTapped: function (params) {
    self.contextInput.text = ""
  },
  configAddTapped: function (params) {
    let self = getSnippetsController()
    self.titleInput.text = "标题"
    self.contextInput.text = "内容"
    let i = 0
    while (self.prompts["customEngine"+i]) {
      i = i+1
    }
    let prompts = self.prompts
    let config = {title:self.titleInput.text,context:self.contextInput.text}
    prompts["customEngine"+i] = config
    self.prompts = prompts
    self.config.promptNames = self.config.promptNames.concat(("customEngine"+i))
    self.setButtonText(self.config.promptNames,"customEngine"+i)
    self.config.currentPrompt = "customEngine"+i
    self.refreshLayout()
    setLocalDataByKey(self.config,'MNSnippets_config')
    setLocalDataByKey(self.prompts,"MNSnippets_prompts")
  },
  addVariable: function (sender) {
    let vars = ['{{card}}','{{context}}','{{textOCR}}','{{knowledge}}','{{noteDocInfo}}','{{currentDocInfo}}']
    var commandTable = vars.map(variable=>{
      return {title:variable,object:self,selector:'insert:',param:variable}
    })
    self.view.popoverController = getPopoverAndPresent(sender,commandTable,150)
    // let self = getSnippetsController()
    // let range = self.contextInput.selectedRange
    // let pre = self.contextInput.text.slice(0,range.location)
    // let post = self.contextInput.text.slice(range.location)
    // self.contextInput.text = pre+"{{context}}"+post
    // copyJSON(range)
  },
  insert: function (variable) {
    let self = getSnippetsController()
    if (!self.contextInput.hidden) {
      let range = self.contextInput.selectedRange
      let pre = self.contextInput.text.slice(0,range.location)
      let post = self.contextInput.text.slice(range.location+range.length)
      self.contextInput.text = pre+variable+post
    }
  },
  configDeleteTapped: function (params) {
    let self = getSnippetsController()
    if (self.config.promptNames.length === 1) {
      showHUD("不允许清空")
      return
    }
    delete self.prompts[self.config.currentPrompt]
    self.config.promptNames = self.config.promptNames.filter(item=>item !== self.config.currentPrompt)
    self.config.currentPrompt = self.config.promptNames[0]
    self.setButtonText(self.config.promptNames,self.config.currentPrompt)
    self.refreshLayout()
    setLocalDataByKey(self.config,"MNSnippets_config")
    NSUserDefaults.standardUserDefaults().setObjectForKey(self.prompts,"MNSnippets_prompts")
  },
  moveTopTapped :function () {
    let self = getSnippetsController()
    let promptNames = self.config.promptNames
    moveElement(promptNames, self.config.currentPrompt, "top")
    self.config.promptNames = promptNames
    self.setButtonText(promptNames,self.config.currentPrompt)
    self.refreshLayout()
    setLocalDataByKey(self.config,"MNSnippets_config")
  },
  moveForwardTapped :function () {
  try {
    
    let self = getSnippetsController()
    let promptNames = self.config.promptNames
    moveElement(promptNames, self.config.currentPrompt, "up")
    self.config.promptNames = promptNames
    self.setButtonText(promptNames,self.config.currentPrompt)
    self.refreshLayout()
    setLocalDataByKey(self.config,"MNSnippets_config")
  } catch (error) {
    showHUD(error)
  }
  },
  moveBackwardTapped :function () {
    let self = getSnippetsController()
    let promptNames = self.config.promptNames
    moveElement(promptNames, self.config.currentPrompt, "down")
    self.config.promptNames = promptNames
    self.setButtonText(promptNames,self.config.currentPrompt)
    self.refreshLayout()
    setLocalDataByKey(self.config,"MNSnippets_config")

  },
  toggleSelected: async function (button) {
    let self = getSnippetsController()
    button.isSelected = !button.isSelected
    let clickDate = Date.now()
    if (button.clickDate && clickDate-button.clickDate<300) {
      let config = {title:self.titleInput.text,context:self.contextInput.text}
      self.prompts[self.config.currentPrompt] = config
      self.setButtonText(self.config.promptNames,self.config.currentPrompt)
      setLocalDataByKey(self.prompts,"MNSnippets_prompts")
      copy(self.contextInput.text)
      showHUD("文本已复制")
      return
    }else{
      button.clickDate = clickDate
    }
    let title = button.id
    self.config.currentPrompt = title
    self.words.forEach((entryName,index)=>{
      if (entryName !== title) {
        self["nameButton"+index].isSelected = false
        self["nameButton"+index].backgroundColor = hexColorAlpha("#9bb2d6",0.8);
      }
    })
    if (button.isSelected) {
      self.setTextview(title)
      button.backgroundColor = hexColorAlpha("#457bd3",0.8)
    }else{

      button.backgroundColor = hexColorAlpha("#9bb2d6",0.8);
    }
    setLocalDataByKey(self.config,'MNSnippets_config')
  }
});
snippetsController.prototype.init = function () {
  // /**
  //  * @type {snippetsController}
  //  */
  // let ctr = this
  this.homeImage = getImage(this.mainPath + `/home.png`)
  this.gobackImage = getImage(this.mainPath + `/goback.png`)
  this.goforwardImage = getImage(this.mainPath + `/goforward.png`)
  this.reloadImage = getImage(this.mainPath + `/reload.png`)
  this.stopImage = getImage(this.mainPath + `/stop.png`)
  this.QRCodeImage = getImage(this.mainPath + `/QRCode.png`)
  this.settingImage = getImage(this.mainPath + `/setting.png`)
  this.appInstance = Application.sharedInstance();
  this.custom = false;
  this.customMode = "None"
  this.dynamic = true;
  this.miniMode = false;
  this.shouldCopy = false
  this.shouldComment = false
  this.selectedText = '';
  this.searchedText = '';
}

/**
 * @this {snippetsController}
 */
snippetsController.prototype.getNoteVarInfo = async function(noteid,text,OCR_Enabled=false) {
  let config = {}
  let hasContext = text.includes("{{context}}")
  let hasOCR = text.includes("{{textOCR}}")
  let hasCard = text.includes("{{card}}")
  let note = getNoteById(noteid)
  if (OCR_Enabled) {
    if (hasContext || hasOCR) {
      let contextVar = await this.dynamicController.getTextForSearch(note,true)
      if (hasContext) { config.context = contextVar }
      if (hasOCR) { config.textOCR = contextVar }
    }
    if (hasCard) {
      let cardStructure = this.genCardStructure(true)
      let haveImage = false
      if (cardStructure.excerpt && cardStructure.excerpt.image) {
        cardStructure.excerpt = await this.getTextOCR(getMediaByHash(cardStructure.excerpt.image))
        haveImage = true
      }
      if (cardStructure.comments) {
        let comments = cardStructure.comments.map(async comment=>{
          if (comment.image) {
            if (haveImage) { return "" }
            haveImage = true
            return await this.getTextOCR(getMediaByHash(comment.image))
          }
          return comment
        })
        cardStructure.comments = comments
      }
      let cardStructureString = JSON.stringify(cardStructure,null,2)
      config.card = cardStructureString
    }
  }else{
    if (hasContext) {
      contextVar = await this.dynamicController.getTextForSearch(note)
      if (!contextVar) {
        showHUD("No text in note/card!")
        return undefined
      }
      config.context = contextVar
    }
    if (hasCard) {
      let cardStructure = this.genCardStructure()
      // copyJSON(cardStructure)
      if (!Object.keys(cardStructure).length) {
        showHUD("No text in note/card!")
        return undefined
      }
      let cardStructureString = JSON.stringify(cardStructure,null,2)
      config.card = cardStructureString
    }
    if (hasOCR) {
      contextVar = await this.dynamicController.getTextForSearch(note,true)
      config.textOCR = contextVar
    }
  }
  if (text.includes("{{currentDocInfo}}")) {
    let currentFile = getCurrentFile()
    if (!currentFile) {
      return undefined
    }
    config.currentDocInfo = await this.getFileContent(currentFile)
  }
  if (text.includes("{{noteDocInfo}}")) {
    let currentFile = getNoteFile(this.noteId)
    if (!currentFile) {
      currentFile = getCurrentFile()
    }
    if (!currentFile) {
      return undefined
    }
    config.noteDocInfo = await this.getFileContent(currentFile)
    // copy(fileContent)
  }
  let replacedText = this.replacVar(text, config)
  // copyJSON(replacedText)
  return replacedText
}

/**
 * @this {snippetsController}
 */
snippetsController.prototype.getTextVarInfo = async function(text,OCR_Enabled=false) {
  try {
  let config = {}
  let image = undefined
  let fileContent = undefined
  let hasOCR = text.includes("{{textOCR}}")
  let hasContext = text.includes("{{context}}")
  let hasCard = text.includes("{{card}}")
  let hasCurrentDocInfo = text.includes("{{currentDocInfo}}")
  let hasNoteDocInfo = text.includes("{{noteDocInfo}}")

  let selectedText = docController().selectionText
  if (hasOCR || !selectedText || (OCR_Enabled && hasContext)) {
    image = docController().imageFromSelection()
  }
  if (image) {
    selectedText = await this.getTextOCR(image)
    config.textOCR = selectedText
  }
  if (hasContext) {
    config.context = selectedText
  }

  if (hasCard) {
    config.card = selectedText
  }

  if (hasCurrentDocInfo || hasNoteDocInfo) {
    let currentFile = getCurrentFile()
    if (!currentFile) {
      return undefined
    }
    fileContent = await this.getFileContent(currentFile)
    // copy(fileContent)
    if (hasCurrentDocInfo) {
      config.currentDocInfo = fileContent
    }
    if (hasNoteDocInfo) {
      config.noteDocInfo = fileContent
    }
  }
  // copyJSON(config)
  return this.replacVar(text, config)
    } catch (error) {
    showHUD(error)
  }

}

snippetsController.prototype.changeButtonOpacity = function(opacity) {
    this.moveButton.layer.opacity = opacity
    this.maxButton.layer.opacity = opacity
    this.closeButton.layer.opacity = opacity
}
snippetsController.prototype.setButtonLayout = function (button,targetAction) {
    button.autoresizingMask = (1 << 0 | 1 << 3);
    button.setTitleColorForState(UIColor.whiteColor(),0);
    button.setTitleColorForState(this.highlightColor, 1);
    button.backgroundColor = hexColorAlpha("#9bb2d6",0.8);
    button.layer.cornerRadius = 8;
    button.layer.masksToBounds = true;
    if (targetAction) {
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    this.view.addSubview(button);
}


snippetsController.prototype.createButton = function (buttonName,targetAction,superview) {
    this[buttonName] = UIButton.buttonWithType(0);
    this[buttonName].autoresizingMask = (1 << 0 | 1 << 3);
    this[buttonName].setTitleColorForState(UIColor.whiteColor(),0);
    this[buttonName].setTitleColorForState(this.highlightColor, 1);
    this[buttonName].backgroundColor = hexColorAlpha("#9bb2d6",0.8)
    this[buttonName].layer.cornerRadius = 8;
    this[buttonName].layer.masksToBounds = true;
    this[buttonName].titleLabel.font = UIFont.systemFontOfSize(16);

    if (targetAction) {
      this[buttonName].addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    if (superview) {
      this[superview].addSubview(this[buttonName])
    }else{
      this.view.addSubview(this[buttonName]);
    }
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.settingViewLayout = function (){
    let viewFrame = this.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height
    this.settingView.frame = {x:0,y:20,width:width,height:height-20}
    this.scrollview.hidden = this.compactView
    this.newEntryButton.hidden = this.compactView
    this.configReset.hidden = this.compactView
    this.deleteButton.hidden = this.compactView
    this.titleInput.hidden = this.compactView
    this.copyButton.frame = {x:5,y:height-55,width:60,height:30}
    this.pasteButton.frame = {x:70,y:height-55,width:65,height:30}
    this.saveButton.frame = {x:width-65,y:height-55,width:60,height:30}
    this.clearButton.frame = {x:140,y:height-55,width:65,height:30}
    if (this.compactView) {
      this.contextInput.frame = {x:5,y:5,width:width-10,height:height-65}
      return
    }
    this.contextInput.frame = {x:5,y:200,width:width-10,height:height-260}
    this.titleInput.frame = {x:5,y:160,width:width-10,height:35}
    this.scrollview.frame = {x:5,y:5,width:width-10,height:150}
    this.scrollview.contentSize = {width:width-20,height:height};
    this.newEntryButton.frame = {x:width-40,y:120,width:30,height:30}
    // this.addVarButton.frame = {x:width-40,y:height-140,width:30,height:30}
    this.configReset.frame = {x:10,y:120,width:60,height:30}
    this.deleteButton.frame = {x:width-75,y:120,width:30,height:30}
    this.moveDownButton.frame = {x:width-110,y:120,width:30,height:30}
    this.moveUpButton.frame = {x:width-145,y:120,width:30,height:30}
    this.moveTopButton.frame = {x:width-180,y:120,width:30,height:30}
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.createSettingView = function (){
try {
  this.creatView("settingView","view","#ffffff",1.0)
  this.settingView.hidden = true

  this.createButton("configButton","configButtonTapped:","settingView")
  this.configButton.backgroundColor = hexColorAlpha("#457bd3",0.8)
  this.configButton.layer.opacity = 1.0
  this.configButton.setTitleForState("Prompts",0)
  this.configButton.titleLabel.font = UIFont.boldSystemFontOfSize(16)

  this.scrollview = UIScrollView.new()
  this.settingView.addSubview(this.scrollview)
  this.scrollview.hidden = false
  this.scrollview.delegate = this
  this.scrollview.bounces = true
  this.scrollview.alwaysBounceVertical = true
  this.scrollview.layer.cornerRadius = 8
  this.scrollview.backgroundColor = hexColorAlpha("#c0bfbf",0.8)

  this.creatTextView("contextInput","settingView")

  this.creatTextView("titleInput","settingView","#9bb2d6")
  // let entries           = NSUserDefaults.standardUserDefaults().objectForKey('MNBrowser_entries');
  // copyJSON(this.prompts)
  // copy(text)
  let text  = this.prompts[this.config.currentPrompt]
  if (text && text.context) {
    this.contextInput.text = text.context
  }else{
    this.contextInput.text = "内容"
  }
  if (text && text.title) {
    this.titleInput.text = text.title
  }else{
    this.titleInput.text = "标题"
  }
  this.titleInput.contentInset = {top: 0,left: 0,bottom: 0,right: 0}
  this.titleInput.textContainerInset = {top: 0,left: 0,bottom: 0,right: 0}

  this.createButton("configReset","resetConfig:","settingView")
  this.configReset.layer.opacity = 1.0
  this.configReset.setTitleForState("Reset",0)

  this.createButton("saveButton","configSaveTapped:","settingView")
  this.saveButton.layer.opacity = 1.0
  this.saveButton.setTitleForState("Save",0)

  this.createButton("clearButton","clearButtonTapped:","settingView")
  this.clearButton.layer.opacity = 1.0
  this.clearButton.setTitleForState("Clear",0)

  this.createButton("deleteButton","configDeleteTapped:","settingView")
  this.deleteButton.layer.opacity = 1.0
  this.deleteButton.setTitleForState("🗑",0)
  this.createButton("newEntryButton","configAddTapped:","settingView")
  this.newEntryButton.layer.opacity = 1.0
  this.newEntryButton.setTitleForState("➕",0)

  this.createButton("moveUpButton","moveForwardTapped:","settingView")
  this.moveUpButton.layer.opacity = 1.0
  this.moveUpButton.setTitleForState("⬆",0)
  this.createButton("moveDownButton","moveBackwardTapped:","settingView")
  this.moveDownButton.layer.opacity = 1.0
  this.moveDownButton.setTitleForState("⬇",0)
  this.createButton("moveTopButton","moveTopTapped:","settingView")
  this.moveTopButton.layer.opacity = 1.0
  this.moveTopButton.setTitleForState("🔝",0)

  // this.createButton("addVarButton","addVariable:","settingView")
  // this.addVarButton.layer.opacity = 1.0
  // this.addVarButton.setTitleForState("➕",0)

  this.createButton("copyButton","copyButtonTapped:","settingView")
  this.copyButton.layer.opacity = 1.0
  this.copyButton.setTitleForState("Copy",0)
  this.copyButton.backgroundColor = hexColorAlpha("#9bb2d6",0.8)

  this.createButton("pasteButton","pasteButtonTapped:","settingView")
  this.pasteButton.layer.opacity = 1.0
  // this.pasteButton.backgroundColor = hexColorAlpha("#457bd3",0.8)
  this.pasteButton.backgroundColor = hexColorAlpha("#9bb2d6",0.8)
  this.pasteButton.setTitleForState("Paste",0)
} catch (error) {
  showHUD(error)
  copy(error)
}
}

/**
 * @this {snippetsController}
 */
snippetsController.prototype.setButtonText = function (names,highlight) {
    this.words = names

    names.map((word,index)=>{
      if (!this["nameButton"+index]) {
        this.createButton("nameButton"+index,"toggleSelected:","scrollview")
        // this["nameButton"+index].index = index
        this["nameButton"+index].titleLabel.font = UIFont.systemFontOfSize(16);
      }
      this["nameButton"+index].hidden = false
      // this["nameButton"+index].tag = 
      // if (!this.entries[word]) {
        
      // }
      this["nameButton"+index].setTitleForState(this.prompts[word].title,0) 
      this["nameButton"+index].id = word

      if (word === highlight) {
        this["nameButton"+index].backgroundColor = hexColorAlpha("#457bd3",0.8)
        this["nameButton"+index].isSelected = true
      }else{
        this["nameButton"+index].backgroundColor = hexColorAlpha("#9bb2d6",0.8);
        this["nameButton"+index].isSelected = false
      }
      // this["nameButton"+index].titleEdgeInsets = {top:0,left:-100,bottom:0,right:-50}
      // this["nameButton"+index].setTitleForState(this.imagePattern[index]===this.textPattern[index]?` ${this.imagePattern[index]} `:"-1",0) 
    })
    this.refreshLayout()
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.setTextview = function (name) {
      // let entries           =  NSUserDefaults.standardUserDefaults().objectForKey('MNBrowser_entries');
      let text  = this.prompts[name]
      this.titleInput.text= text.title
      this.contextInput.text = text.context?text.context:""
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.refreshLayout = function () {
  if (!this.settingView) {return}
  if (!this.settingView.hidden) {
    var viewFrame = this.scrollview.bounds;
    var xLeft     = 0
    let initX = 10
    let initY = 10
    let initL = 0
    this.locs = [];
    this.words.map((word,index)=>{
      let title = this.prompts[word].title
      let width = strCode(title.replaceAll(" ",""))*9+15
      if (xLeft+initX+width > viewFrame.width-10) {
        initX = 10
        initY = initY+40
        initL = initL+1
      }
      this["nameButton"+index].frame = {  x: xLeft+initX,  y: initY,  width: width,  height: 30,};
      this.locs.push({
        x:xLeft+initX,
        y:initY,
        l:initL,
        i:index
      })
      initX = initX+width+10
    })
    if (this.lastLength && this.lastLength>this.words.length) {
      for (let index = this.words.length; index < this.lastLength; index++) {
        this["nameButton"+index].hidden = true
      }
    }
    this.lastLength = this.words.length
    this.scrollview.contentSize= {width:viewFrame.width,height:initY+40}
  
  }
}

snippetsController.prototype.hideAllButton = function (frame) {
  this.moveButton.hidden = true
  this.closeButton.hidden = true
  this.maxButton.hidden = true
}
snippetsController.prototype.showAllButton = function (frame) {
  this.moveButton.hidden = false
  this.closeButton.hidden = false
  this.maxButton.hidden = false
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.show = function (frame) {
  studyController().view.bringSubviewToFront(this.view)
  studyController().view.bringSubviewToFront(this.addonBar)
  let preFrame = this.currentFrame
  let preOpacity = this.view.layer.opacity
  this.view.layer.opacity = 0.2
  // this.settingView.hidden = true
  // if (frame) {
  //   this.view.frame = frame
  //   this.currentFrame = frame
  // }
  this.view.hidden = false
  this.miniMode = false
  this.hideAllButton()

  UIView.animateWithDurationAnimationsCompletion(0.2,()=>{
    this.view.layer.opacity = preOpacity
    // this.view.frame = preFrame
    // this.currentFrame = preFrame
  },
  ()=>{
    this.view.layer.borderWidth = 0
    this.showAllButton()
    try {
      
    this.settingView.hidden = false
    } catch (error) {
      showHUD(error)
    }
  })
}
snippetsController.prototype.hide = function (frame) {
  studyController().view.bringSubviewToFront(this.addonBar)
  let preFrame = this.view.frame
  let preOpacity = this.view.layer.opacity
  let preCustom = this.custom
  this.hideAllButton()
  this.custom = false
  UIView.animateWithDurationAnimationsCompletion(0.25,()=>{
    this.view.layer.opacity = 0.2
    // if (frame) {
    //   this.view.frame = frame
    //   this.currentFrame = frame
    // }
    // this.view.frame = {x:preFrame.x+preFrame.width*0.1,y:preFrame.y+preFrame.height*0.1,width:preFrame.width*0.8,height:preFrame.height*0.8}
    // this.currentFrame = {x:preFrame.x+preFrame.width*0.1,y:preFrame.y+preFrame.height*0.1,width:preFrame.width*0.8,height:preFrame.height*0.8}
  },
  ()=>{
    this.view.hidden = true;
    this.view.layer.opacity = preOpacity      
    this.view.frame = preFrame
    this.currentFrame = preFrame
    this.custom = preCustom
    // this.view.frame = preFrame
    // this.currentFrame = preFrame
  })
}

snippetsController.prototype.creatView = function (viewName,superview="view",color="#9bb2d6",alpha=0.8) {
  this[viewName] = UIView.new()
  this[viewName].backgroundColor = hexColorAlpha(color,alpha)
  this[viewName].layer.cornerRadius = 12
  this[superview].addSubview(this[viewName])
}

snippetsController.prototype.creatTextView = function (viewName,superview="view",color="#c0bfbf",alpha=0.8) {
  this[viewName] = UITextView.new()
  this[viewName].font = UIFont.systemFontOfSize(15);
  this[viewName].layer.cornerRadius = 8
  this[viewName].backgroundColor = hexColorAlpha(color,alpha)
  this[viewName].textColor = UIColor.blackColor()
  this[viewName].delegate = this
  this[viewName].bounces = true
  this[superview].addSubview(this[viewName])
}

/**
 * @this {snippetsController}
 */
snippetsController.prototype.fetchKeys = async function (authorization,string) {
  // let url = `https://usage.feliks.top?query=key`
  let url = `https://file.feliks.top/sharedKeys.json`

  try {
    const res = await this.fetch(url,
      {
        method: "Get",
        timeout: 60
      }
    )
    return res;
  } catch (error) {
    showHUD(error)
    return undefined
  }
}

snippetsController.prototype.getUsage = async function (authorization,string) {
  let url = this.config.url
  let urlSubscription = url+'/v1/dashboard/billing/subscription'
  let urlUsage = url+"/v1/dashboard/billing/usage"

  let key = this.config.openaiKey
  if (key.trim() === "") {
    showHUD("no api key")
    return
  }
  let headers = {
      'Authorization': 'Bearer '+key,
      "Content-Type": "application/json"
  }
  let usage = {}
  const res = await this.fetch(urlUsage,
    {
      method: "GET",
      timeout: 60,
      headers: headers
    }
  )
  usage.usage = res.total_usage
  const total = await this.fetch(urlSubscription,
    {
      method: "GET",
      timeout: 60,
      headers: headers
    }
  )
  usage.total = total.hard_limit_usd
  return usage;
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.fetch = async function (url,options = {}){
  return new Promise((resolve, reject) => {
    // UIApplication.sharedApplication().networkActivityIndicatorVisible = true
    const queue = NSOperationQueue.mainQueue()
    const request = this.initRequest(url, options)
    NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
      request,
      queue,
      (res, data, err) => {
        if (err.localizedDescription) reject(err.localizedDescription)
        // if (data.length() === 0) resolve({})
        const result = NSJSONSerialization.JSONObjectWithDataOptions(
          data,
          1<<0
        )
        if (NSJSONSerialization.isValidJSONObject(result)) resolve(result)
        resolve(result)
      }
    )
  })
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.initRequest = function (url,options) {
  const request = NSMutableURLRequest.requestWithURL(genNSURL(url))
  request.setHTTPMethod(options.method ?? "GET")
  request.setTimeoutInterval(options.timeout ?? 10)
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15",
    "Content-Type": "application/json",
    Accept: "application/json"
  }
  request.setAllHTTPHeaderFields({
    ...headers,
    ...(options.headers ?? {})
  })
  if (options.search) {
    request.setURL(
      genNSURL(
        `${url.trim()}?${Object.entries(options.search).reduce((acc, cur) => {
          const [key, value] = cur
          return `${acc ? acc + "&" : ""}${key}=${encodeURIComponent(value)}`
        }, "")}`
      )
    )
  } else if (options.body) {
    request.setHTTPBody(NSData.dataWithStringEncoding(options.body, 4))
  } else if (options.form) {
    request.setHTTPBody(
      NSData.dataWithStringEncoding(
        Object.entries(options.form).reduce((acc, cur) => {
          const [key, value] = cur
          return `${acc ? acc + "&" : ""}${key}=${encodeURIComponent(value)}`
        }, ""),
        4
      )
    )
  } else if (options.json) {
    request.setHTTPBody(
      NSJSONSerialization.dataWithJSONObjectOptions(
        options.json,
        1
      )
    )
  }
  return request
}
/**
 * @this {snippetsController}
 */
snippetsController.prototype.genCardStructure = function (OCR_enabled=false) {
  // let hasImage = false
  let cardStructure = {}
  // let noteId  = this.currentNoteId
  let note = getNoteById(this.currentNoteId)
  // if (!note) {
  //   showHUD(this.currentNoteId)
  //   showHUD("no note")
  //   return ""
  // }
  if (note.noteTitle && note.noteTitle !== "") {
    cardStructure.title = note.noteTitle
  }
  if (OCR_enabled && note.excerptPic && !note.textFirst) {
    cardStructure.excerpt = {image:note.excerptPic.paint}
    // hasImage = true
  }else if (noteHasExcerptText(note)){
    cardStructure.excerpt = note.excerptText
  }
  if (note.comments.length) {
    let comments = []
    note.comments.map(comment=>{
      switch (comment.type) {
        case "TextNote":
          if (/^marginnote3app:\/\//.test(comment.text)) {
            return false
          }else{
            comments.push(comment.text)
            return true
          }
        case "HtmlNote":
          comments.push(comment.text)
          return true
        case "LinkNote":
          if (OCR_enabled && comment.q_hpic && !note.textFirst) {
            comments.push({image:getMediaByHash(comment.q_hpic.paint)})
            return true
          }else{
            comments.push(comment.q_htext)
            return true
          }
        case "PaintNote":
          if (OCR_enabled && comment.paint){
            comments.push({image:getMediaByHash(comment.paint)})
            return true
          }
          return false
        default:
          return false
      }
    })
    cardStructure.comments = comments
  }
  return cardStructure
}

/** @type {UITextView} */
snippetsController.prototype.contextInput