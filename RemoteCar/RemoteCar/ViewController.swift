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
    
    let repeatKeyInteval = 0.1
    
    var serverPort  = 9999
    var serverAddr = " 10.17.6.27"
    var speed = 1.0
    var lastKey = 0
    
    @IBOutlet weak var addrText: UITextField!
    @IBOutlet weak var portText: UITextField!
    
    @IBOutlet weak var speedLabel: UILabel!
    
    
    var timer = NSTimer()
    

    @IBAction func speedUp(sender: AnyObject) {
        if((0.9 - self.speed) > 0.01){
            self.speed = self.speed + 0.1;
        }else{
            self.speed = 1;
        }
        self.saveData();
        self.sendSpeedChange();
    }
    
    @IBAction func speedDown(sender: AnyObject) {
        if((self.speed - 0.1) > 0.01){
            self.speed = self.speed - 0.1;
        }else{
            self.speed = 0;
        }
        self.saveData();
        self.sendSpeedChange();
    }
    
    func sendSpeedChange(){
        //发送用户名给服务器（这里使用随机生成的）
        let msgtosend=["type":"BASE_RATE_CHANGE","body":["baseRate": self.speed]]
        self.sendMessage(msgtosend)
        dispatch_async(dispatch_get_main_queue(), {
            self.speedLabel.text="\(self.speed)";
        })
    }
    
    func saveData(){
        self.serverPort=Int((self.portText.text!))!
        NSUserDefaults.standardUserDefaults().setInteger(self.serverPort, forKey: "serverPort")
        
        NSUserDefaults.standardUserDefaults().setDouble(self.speed, forKey: "speed")
        //
        self.serverAddr=self.addrText.text!
        NSUserDefaults.standardUserDefaults().setValue(self.serverAddr, forKey: "serverAddr")
        self.view.endEditing(true);
    }
    @IBAction func clickReconnect(sender: AnyObject) {
        self.saveData();
        self.connectToServer();
        
    }
    //
    func loadDefaultData(){
        let userDefaults =  NSUserDefaults.standardUserDefaults()
        print(userDefaults)
        let _serverAddr:String? = NSUserDefaults.standardUserDefaults().stringForKey("serverAddr")
        if (!(_serverAddr == nil)){
            self.serverAddr = _serverAddr!;
        }
        let _serverPort:Int? = NSUserDefaults.standardUserDefaults().integerForKey("serverPort")
        if (!(_serverPort == 0)){
            self.serverPort=_serverPort!;
        }
        let _speed:Double? = NSUserDefaults.standardUserDefaults().doubleForKey("speed")
        if (!(_speed == 0)){
            self.speed=_speed!;
        }
        self.addrText.text=self.serverAddr;
        self.speedLabel.text="\(self.speed)";
        self.portText.text="\(self.serverPort)";
    }
    
    
    func connectToServer(){
        self.socketClient=TCPClient(addr: self.serverAddr, port: self.serverPort)
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
                self.sendSpeedChange();
                
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
        self.loadDefaultData();
        self.connectToServer();
        
        timer = NSTimer.scheduledTimerWithTimeInterval(repeatKeyInteval, target: self, selector: (#selector(ViewController.repeatKey)), userInfo:nil,repeats: true)
        
    }
    
    func repeatKey(){
        if(lastKey>0){
            self.sendKeyEvent(lastKey,eventCode: TOUCH_PRESS)
        }
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
        self.titleLabel.text="MovingFront";
        lastKey=KEY_UP
        self.sendKeyEvent(KEY_UP,eventCode: TOUCH_PRESS)
    }
    
    
    @IBAction func moveBack(sender: AnyObject) {
        titleLabel.text="MovingBack";
        lastKey=KEY_DOWN
        self.sendKeyEvent(KEY_DOWN,eventCode: TOUCH_PRESS)
    }
    
    
    @IBAction func turnLeft(sender: AnyObject) {
        self.titleLabel.text="turnLeft";
        lastKey=KEY_LEFT
        self.sendKeyEvent(KEY_LEFT,eventCode: TOUCH_PRESS)
    }
    
    @IBAction func turnRight(sender: AnyObject) {
        self.titleLabel.text="turnRight";
        lastKey=KEY_RIGHT
        self.sendKeyEvent(KEY_RIGHT,eventCode: TOUCH_PRESS)
    }
    
    @IBAction func touchUp(sender: AnyObject) {
        self.titleLabel.text="WaitingAction";
        lastKey=0
        self.sendKeyEvent(KEY_ENTER,eventCode: TOUCH_RELEASE)
    }
    
    
    @IBAction func stop(sender: AnyObject) {
        self.titleLabel.text="Stoping";
        lastKey = 0
        self.sendKeyEvent(KEY_ENTER,eventCode: TOUCH_PRESS)
    }
    
}

