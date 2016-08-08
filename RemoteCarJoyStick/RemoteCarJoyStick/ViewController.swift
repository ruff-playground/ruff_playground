//
//  ViewController.swift
//  RemoteCarJoyStick
//
//  Created by YongliuLi on 8/7/16.
//  Copyright © 2016 YongliuLi. All rights reserved.
//

import UIKit
class ViewController: UIViewController {
    @IBOutlet var panGesture: UIPanGestureRecognizer!
    var panCount = 0
    var serverPort  = 8899
    var beginPosition = CGPoint(x:0,y:0)
    var currentPosition = CGPoint(x:0,y:0)
    var transform = CGPoint(x:0 ,y:0)
    var center = CGPoint(x:0 ,y:0)
    let MAX_TRANSFORM_LEN:CGFloat=100.0
    var socketClient:TCPClient?
    var lastSpeed = CGPoint(x:0,y:0)
    var lastSentTime:NSTimeInterval = 0
    // unit : second
    var msgSentInteval:NSTimeInterval = 0.5
    var speedDownInterval = 0.2
    var timer =  NSTimer()
    var isTouched = false
    var speedSteps:CGFloat = 5

    @IBOutlet weak var circleButton: UIImageView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        print(self.view.bounds.width)
        print(self.view.bounds.height)
        center = CGPoint(x: self.view.frame.width/2 ,y:self.view.frame.height/2)
        circleButton.center = center;
        self.connectToServer();
        timer = NSTimer.scheduledTimerWithTimeInterval(speedDownInterval, target: self, selector: (#selector(ViewController.updateTimer)), userInfo:nil,repeats: true)
    }
    
    var speedDownStep:CGFloat = 0.3;
    func  speedDown(x:CGFloat) -> CGFloat{
        var ret:CGFloat = 0.0
        if(x > speedDownStep){
            ret = x - speedDownStep;
        }else if(x < -1.0 * speedDownStep){
            ret = x + speedDownStep;
        }else {
            ret = 0.0;
        }
        return ret
    }
    func updateTimer(){
        var newSpeed=CGPoint(x:0, y:0);
        if(isTouched == false){
            
            if(lastSpeed.x == 0 && lastSpeed.y == 0){
                return;
            }
            newSpeed.x = self.speedDown(lastSpeed.x)
            newSpeed.y = self.speedDown(lastSpeed.y)
            self.sendSpeedChangeEvent(newSpeed.x, y: newSpeed.y)
            print("no touches, speed downing!",newSpeed)
        }
    }
    
    func connectToServer(){
        socketClient=TCPClient(addr: "10.17.6.27", port: serverPort)
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), {
            () -> Void in
            
            //用于读取并解析服务端发来的消息
            func readmsg()->NSDictionary?{
                return nil
                //read 4 byte int as type
                if let data=self.socketClient!.read(4){
                    if data.count==4{
                        let ndata=NSData(bytes: data, length: data.count)
                        var len:Int32=0
                        ndata.getBytes(&len, length: data.count)
                        if let buff=self.socketClient!.read(Int(len)){
                            let msgd:NSData=NSData(bytes: buff, length: buff.count)
                            let msgi:NSDictionary =
                                (try! NSJSONSerialization.JSONObjectWithData(msgd,
                                    options: .MutableContainers)) as! NSDictionary
                            return msgi
                        }
                    }
                }
                return nil
            }
            
            //连接服务器
            let (success, msg)=self.socketClient!.connect(timeout: 5)
            if success{
                dispatch_async(dispatch_get_main_queue(), {
                    print("connect success")
                })
                
                //发送用户名给服务器（这里使用随机生成的）
                let msgtosend=["cmd":"nickname","nickname":"游客\(Int(arc4random()%1000))"]
                self.sendMessage(msgtosend)
                
                //不断接收服务器发来的消息
                while true{
                    if let msg=readmsg(){
                        dispatch_async(dispatch_get_main_queue(), {
                            self.processMessage(msg)
                        })
                    }else{
                        dispatch_async(dispatch_get_main_queue(), {
                            //self.disconnect()
                        })
                        break
                    }
                }
            }else{
                dispatch_async(dispatch_get_main_queue(), {
                    print(msg)
                })
            }
        })
        
    }
    
    //发送消息
    func sendMessage(msgtosend:NSDictionary){
        let msgdata=try? NSJSONSerialization.dataWithJSONObject(msgtosend,
                                                                options: NSJSONWritingOptions())
        //var len:Int32=Int32(msgdata!.length)
        //let data:NSMutableData=NSMutableData(bytes: &len, length: 4)
        //self.socketClient!.send(data: data)
        if(self.socketClient!.fd==0){
            return
        }
        self.socketClient!.send(data:msgdata!)
        self.socketClient!.send(data:"\n".dataUsingEncoding(NSUTF8StringEncoding)!)
        
    }
    
    //处理服务器返回的消息
    func processMessage(msg:NSDictionary){
        //        let cmd:String=msg["cmd"] as! String
        //        switch(cmd){
        //        case "msg":
        //            self.textView.text = self.textView.text +
        //                (msg["from"] as! String) + ": " + (msg["content"] as! String) + "\n"
        //        default:
        //            print(msg)
        //        }
    }
    

    
    override func touchesBegan(touches: Set<UITouch>, withEvent event: UIEvent?) {
        let touch : UITouch! = touches.first!;
        beginPosition=touch.locationInView(self.view);
        print("touch Began")
    }
    
    override func touchesMoved(touches: Set<UITouch>, withEvent event: UIEvent?) {
        let touch : UITouch! = touches.first!;
        isTouched = true;
        
        currentPosition = touch.locationInView(self.view)
        
        
        transform=CGPoint(x:currentPosition.x-beginPosition.x,y: currentPosition.y - beginPosition.y)
        //
        let len = sqrt(pow(transform.x, 2) + pow(transform.y, 2))
        if(len > MAX_TRANSFORM_LEN){
            let rate = MAX_TRANSFORM_LEN/len
            transform=CGPoint(x:transform.x * rate,y: transform.y * rate)
        }
        
        
        circleButton.center = CGPoint(x: self.view.center.x + transform.x, y: self.view.center.y +  transform.y)
        self.sendSpeedChangeEvent(transform.x/MAX_TRANSFORM_LEN, y: -1 * transform.y/MAX_TRANSFORM_LEN);
        //print("touch moving!",transform)
    }
    
    func sendSpeedChangeEvent(x:CGFloat, y:CGFloat) {
        let newSpeed = CGPoint(x:round(x * speedSteps)/speedSteps,y: round(y*speedSteps)/speedSteps)
        let newTime = NSDate().timeIntervalSince1970
        let intervalFromLast = (newTime - lastSentTime)
        
        if(newSpeed.x == lastSpeed.x && newSpeed.y == lastSpeed.y && intervalFromLast < msgSentInteval){
            print("msg sent too fast! since last:", intervalFromLast );
            return;
        }
        lastSentTime = newTime
        lastSpeed = newSpeed
        print("msg sent");
        let message=["type": "SPEED_CHANGE",
                     "body": ["x": round(x * speedSteps)/speedSteps, "y": round(y*speedSteps)/speedSteps]]
        
        self.sendMessage(message)
    }
    
    
    override func touchesEnded(touches: Set<UITouch>, withEvent event: UIEvent?) {
        circleButton.center = center;
        //self.sendSpeedChangeEvent(0.0,y:0.0);
        isTouched = false;
        print("touch end")
    }
    
    override func touchesCancelled(touches: Set<UITouch>?, withEvent event: UIEvent?) {
        //self.sendSpeedChangeEvent(0.0,y:0.0);
        isTouched = false;
        print("touch cancelled")
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

