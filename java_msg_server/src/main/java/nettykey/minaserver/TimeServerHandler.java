package nettykey.minaserver;

import com.fasterxml.jackson.databind.JsonNode;
import nettykey.domain.Message;
import nettykey.util.JSONUtil;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;

import static nettykey.domain.Message.*;

/**
 * 服务器端业务逻辑
 */
public class TimeServerHandler extends IoHandlerAdapter {

    SessionHandler sessionHandler;

    public TimeServerHandler(SessionHandler sessionHander) {
        super();
        this.sessionHandler = sessionHander;
    }


    /**
     * 连接创建事件
     */
    @Override
    public void sessionCreated(IoSession session) {
        // 显示客户端的ip和端口
        System.out.println(session.getRemoteAddress().toString());

    }

    @Override
    public void exceptionCaught(IoSession session, Throwable cause) throws Exception {
        cause.printStackTrace();
    }

    /**
     * 消息接收事件
     */
    @Override
    public void messageReceived(IoSession session, Object message) throws Exception {
        String strMsg = message.toString();
        // 返回消息字符串
        session.write("{\"msg\":\"Hi Client!\"}\n");
        // 打印客户端传来的消息内容
        System.out.println("Message written : " + strMsg);
        //
        JsonNode node = JSONUtil.readTree(strMsg);
        if (node == null || node.get("type") == null) {
            System.out.println("Message written : " + strMsg);
            return;
        }
        System.out.println("Message type : " + node.get("type").textValue());
        String type = node.get("type").textValue();
        JsonNode bodyNode = node.get("body");
        if (KEY_EVENT.equals(type)) {
            sessionHandler.sendMsg(JSONUtil.toJson(Message.simpleKeyEventMessage(bodyNode.get("keyCode").asInt(), bodyNode.get("eventCode").asInt())));
        }
        if (SPEED_CHANGE.equals(type)) {
            sessionHandler.sendMsg(JSONUtil.toJson(Message.speedChangeEventMessage(bodyNode.get("x").asDouble(0.0), bodyNode.get("y").asDouble(0.0))));
        }
        if (BASE_RATE_CHANGE.equals(type)) {
            sessionHandler.sendMsg(JSONUtil.toJson(Message.baseRateChangeEventMessage(bodyNode.get("baseRate").asDouble(0.0))));
        }

    }

    @Override
    public void sessionIdle(IoSession session, IdleStatus status) throws Exception {
        System.out.println("IDLE" + session.getIdleCount(status));
    }

    @Override
    public void sessionOpened(IoSession session) throws Exception {
        System.out.println("session opened!");
        sessionHandler.sessionOpened(session);
    }

    @Override
    public void sessionClosed(IoSession session) throws Exception {
        sessionHandler.sessionClosed(session);
        System.out.println("session closed!");
    }


}