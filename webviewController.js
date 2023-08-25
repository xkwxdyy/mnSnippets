var mnPinCopyController = JSB.defineClass(
  'mnPinCopyController : UIViewController', {
    viewDidLoad: function() {
      let config  =  NSUserDefaults.standardUserDefaults().objectForKey("mnPinCopy")
      self.appInstance = Application.sharedInstance();
      self.closeImage = UIImage.imageWithDataScale(NSData.dataWithContentsOfFile(self.mainPath + `/close.png`), 2)
      self.lastFrame = self.view.frame;
      self.currentFrame = self.view.frame
      self.moveDate = Date.now()
      self.view.layer.shadowOffset = {width: 0, height: 0};
      self.view.layer.shadowRadius = 15;
      self.view.layer.shadowOpacity = 0.5;
      self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1);
      self.view.layer.opacity = 1.0
      self.view.layer.cornerRadius = 11
      self.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.8)
      // 底下的 toolbar 选中后的背景颜色
      self.highlightColor = UIColor.blendedColor(
        UIColor.colorWithHexString("#2c4d81").colorWithAlphaComponent(0.8),
        Application.sharedInstance().defaultTextColor,
        0.8
      );

      self.moveButton = UIButton.buttonWithType(0);
      self.setButtonLayout(self.moveButton)
      self.moveButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)

      // 新建一个关闭按钮对象
      self.closeButton = UIButton.buttonWithType(0);
      self.setButtonLayout(self.closeButton,"closeButtonTapped:")
      self.closeButton.setImageForState(self.closeImage,0)
      self.closeButton.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0)
      self.closeButton.titleLabel.font = UIFont.systemFontOfSize(14);


      // 新建一个文本框对象
      self.textviewPinText = UITextView.new()
      self.textviewPinText.font = UIFont.systemFontOfSize(16);
      self.textviewPinText.layer.cornerRadius = 8
      // 输入框的背景颜色
      self.textviewPinText.backgroundColor = UIColor.grayColor().colorWithAlphaComponent(0.3)  // 透明度
      self.view.addSubview(self.textviewPinText)
      // 输入框的默认文本
      self.textviewPinText.text = `Input here`
      self.textviewPinText.bounces = true


      // 新建一个复制按钮对象
      self.copyButton = UIButton.buttonWithType(0);
      self.setButtonLayout(self.copyButton,"copyButtonTapped:")
      self.copyButton.layer.cornerRadius = 5
      self.copyButton.setTitleForState("Copy",0)
      self.copyButton.titleLabel.font = UIFont.systemFontOfSize(18);


      // 新建一个粘贴按钮对象
      self.pasteButton = UIButton.buttonWithType(0);
      // 点击后执行的方法 pasteButtonTapped
      self.setButtonLayout(self.pasteButton,"pasteButtonTapped:")
      self.pasteButton.layer.cornerRadius = 5
      self.pasteButton.setTitleForState("Paste",0)
      self.pasteButton.titleLabel.font = UIFont.systemFontOfSize(18);



      // self.moveGesture1 = new UIPanGestureRecognizer(self,"onMoveGesture:")
      // self.pasteButton.addGestureRecognizer(self.moveGesture1)
      // self.moveGesture1.view.hidden = false
      // self.moveGesture1.addTargetAction(self,"onMoveGesture:")

      // 拖拽最下方的长条可移动窗口
      self.moveGesture = new UIPanGestureRecognizer(self,"onMoveGesture:")
      self.moveButton.addGestureRecognizer(self.moveGesture)
      self.moveGesture.view.hidden = false
      self.moveGesture.addTargetAction(self,"onMoveGesture:")

      // 拖拽最右下角的按钮可改变窗口大小
      self.resizeGesture = new UIPanGestureRecognizer(self,"onResizeGesture:")
      self.closeButton.addGestureRecognizer(self.resizeGesture)
      self.resizeGesture.view.hidden = false
      self.resizeGesture.addTargetAction(self,"onResizeGesture:")

      // self.resizeGesture = new UIPanGestureRecognizer(self,"onResizeGesture:")
      // self.copyButton.addGestureRecognizer(self.resizeGesture)
      // self.resizeGesture.view.hidden = false
      // self.resizeGesture.addTargetAction(self,"onResizeGesture:")
    },
    viewWillAppear: function(animated) {
    },
    viewWillDisappear: function(animated) {
    },
  viewWillLayoutSubviews: function() {
    if (self.miniMode) {
      return
    }
    // // viewFrame 获取当前窗口的边界对象
    // var viewFrame = self.view.bounds;
    // // xLeft：窗口左边界
    // var xLeft     = viewFrame.x
    // // xRight：窗口右边界
    // var xRight    = xLeft + viewFrame.width
    // // yTop：窗口上边界
    // var yTop      = viewFrame.y
    // // yBottom：窗口下边界
    // var yBottom   = yTop + viewFrame.height
    // var halfHeight = (viewFrame.height-100)*0.5
    // var halfWidth = (viewFrame.width-15)*0.5
    // viewFrame.y = 5
    // viewFrame.x = 5
    // viewFrame.height -= 10
    // viewFrame.width -= 10
    // // 设置输入框的边界
    // self.textviewPinText.frame = viewFrame

    // self.closeButton.frame = {x: xRight-35,y: yBottom-35, width: 30, height: 30};
    // self.moveButton.frame = {x: xLeft+5, y: yBottom-35, width: xRight-10, height: 30};
    // self.copyButton.frame = { x: viewFrame.width-60,  y: yBottom-80,  width: 60,  height: 30};
    // self.pasteButton.frame = { x: viewFrame.width-130,  y: yBottom-80,  width: 60,  height: 30};

    // viewFrame.y = 15 + halfHeight
    // viewFrame.height = 30
    // viewFrame.width = halfWidth
    var viewFrame = self.view.bounds;
    var xLeft     = viewFrame.x
    var xRight    = xLeft + viewFrame.width
    var yTop      = viewFrame.y
    var yBottom   = yTop + viewFrame.height
    self.closeButton.frame = {x: xRight-35,y: yBottom-35,width: 30,height: 30};
    self.moveButton.frame = {x: xLeft+5 ,y: yBottom-35,width: xRight-10,height: 30};
    var halfHeight = (viewFrame.height-100)*0.5
    var halfWidth = (viewFrame.width-15)*0.5
    viewFrame.y = 5
    viewFrame.x = 5
    viewFrame.height = halfHeight
    viewFrame.width = viewFrame.width -10

    self.textviewPinText.frame = viewFrame

    self.pasteButton.frame = {  x: viewFrame.width-60,  y: viewFrame.height-30,  width: 60,  height: 30,};
    viewFrame.y = 10+halfHeight

    self.copyButton.frame = {  x: viewFrame.width-60,  y: halfHeight+viewFrame.height-25,  width: 60,  height: 30,};
    viewFrame.y = 15+halfHeight*2
    viewFrame.height = 45
    viewFrame.width = halfWidth
  },
  scrollViewDidScroll: function() {
  },
  pasteButtonTapped: function() {
    // 将剪切板的内容输出到 input 框
    self.textviewPinText.text = UIPasteboard.generalPasteboard().string
  },
  copyButtonTapped: function() {
    // 将 output 框的内容复制到剪切板
    UIPasteboard.generalPasteboard().string = self.textviewPinText.text
  },
  closeButtonTapped: function() {
    // 隐藏窗口
    self.view.hidden = true;
  },
  onMoveGesture:function (gesture) {
    let locationToMN = gesture.locationInView(self.appInstance.studyController(self.view.window).view)
    if ( (Date.now() - self.moveDate) > 100) {
      let translation = gesture.translationInView(self.appInstance.studyController(self.view.window).view)
      let locationToBrowser = gesture.locationInView(self.view)
      let locationToButton = gesture.locationInView(gesture.view)
      let buttonFrame = self.moveButton.frame
      let newY = locationToButton.y-translation.y 
      let newX = locationToButton.x-translation.x
      if (gesture.state !== 3 && (newY<buttonFrame.height && newY>0 && newX<buttonFrame.width && newX>0 && Math.abs(translation.y)<20 && Math.abs(translation.x)<20)) {
        self.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
      }
    }
    self.moveDate = Date.now()
    let location = {x:locationToMN.x - self.locationToBrowser.x,y:locationToMN.y -self.locationToBrowser.y}
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
    self.view.frame = {x:x,y:y,width:frame.width,height:frame.height}
    self.currentFrame  = self.view.frame
  },
  onResizeGesture:function (gesture) {
    self.custom = false;
    self.dynamic = false;
    let baseframe = gesture.view.frame
    let locationInView = gesture.locationInView(gesture.view)
    let frame = self.view.frame
    let width = locationInView.x+baseframe.x+baseframe.width*0.5
    let height = locationInView.y+baseframe.y+baseframe.height*0.5
    // 最小宽度
    if (width <= 200) {
      width = 200
    }
    // 最小高度
    if (height <= 100) {
      height = 100
    }
    self.view.frame = {x:frame.x,y:frame.y,width:width,height:height}
    self.currentFrame  = self.view.frame
  },
});

mnPinCopyController.prototype.setButtonLayout = function (button, targetAction) {
    button.autoresizingMask = (1 << 0 | 1 << 3);
    button.setTitleColorForState(UIColor.whiteColor(),0);
    button.setTitleColorForState(this.highlightColor, 1);
    button.backgroundColor = UIColor.colorWithHexString("#9bb2d6").colorWithAlphaComponent(0.8);
    button.layer.cornerRadius = 10;
    button.layer.masksToBounds = true;
    if (targetAction) {
      button.addTargetActionForControlEvents(this, targetAction, 1 << 6);
    }
    this.view.addSubview(button);
}