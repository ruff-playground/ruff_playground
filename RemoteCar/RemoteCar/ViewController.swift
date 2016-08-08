//
//  ViewController.swift
//  RemoteCar
//
//  Created by YongliuLi on 8/6/16.
//  Copyright © 2016 YongliuLi. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    
    var socketClient:TCPClient?
    let KEY_UP = 38
    let KEY_DOWN = 40
    let KEY_LEFT = 37
    let KEY_RIGHT = 39
    let KEY_ENTER = 10
    
    let TOUCH_PRESS = 1
    let TOUCH_RELEASE =  0
    
    func connectToServer(){
        socketClient=TCPClient(addr: "10.17.6.27", port: 8899)
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
    
    @IBOutlet weak var titleLabel: UILabel!
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
    
    func sendKeyEvent(keyCode:Int, eventCode:Int) {
        let message=["type": "KEY_EVENT",
                     "body": ["keyCode": keyCode, "eventCode": eventCode]]
        self.sendMessage(message)
    }
    
    
    @IBAction func moveFront(sender: AnyObject) {
        titleLabel.text="MovingFront";
        self.sendKeyEvent(KEY_UP,eventCode: TOUCH_PRESS)
    }
    
    
    @IBAction func moveBack(sender: AnyObject) {
        titleLabel.text="MovingBack";
        self.sendKeyEvent(KEY_DOWN,eventCode: TOUCH_PRESS)
    }
    
    
    @IBAction func turnLeft(sender: AnyObject) {
        titleLabel.text="turnLeft";
        self.sendKeyEvent(KEY_LEFT,eventCode: TOUCH_PRESS)
    }
    
    @IBAction func turnRight(sender: AnyObject) {
        titleLabel.text="turnRight";
        self.sendKeyEvent(KEY_RIGHT,eventCode: TOUCH_PRESS)
    }
    
    @IBAction func touchUp(sender: AnyObject) {
        titleLabel.text="WaitingAction";
        self.sendKeyEvent(KEY_ENTER,eventCode: TOUCH_RELEASE)
    }
    
    
    @IBAction func stop(sender: AnyObject) {
        titleLabel.text="Stoping";
        self.sendKeyEvent(KEY_ENTER,eventCode: TOUCH_PRESS)
    }
    
}

