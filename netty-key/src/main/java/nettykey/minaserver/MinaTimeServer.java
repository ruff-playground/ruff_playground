package nettykey.minaserver;

import nettykey.domain.Message;
import nettykey.domain.SimpleKeyEvent;
import nettykey.util.JSONUtil;
import org.apache.mina.core.service.IoAcceptor;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.codec.textline.TextLineCodecFactory;
import org.apache.mina.filter.logging.LoggingFilter;
import org.apache.mina.transport.socket.SocketSessionConfig;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;

import java.awt.event.KeyEvent;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.util.LinkedHashSet;
import java.util.Set;

public class MinaTimeServer {
    // 定义监听端口
    private int port = 5556;
    Set<IoSession> sessionSet = new LinkedHashSet<IoSession>();

    public MinaTimeServer(int port) {
        // 创建服务端监控线程
        this.port = port;

    }

    public void run() throws IOException {

        TimeServerHandler handler = new TimeServerHandler(new SessionHandler() {
            public void sessionOpened(IoSession ioSession) {
                sessionSet.add(ioSession);
            }

            public void sessionClosed(IoSession ioSession) {
                sessionSet.remove(ioSession);
            }
        });

        IoAcceptor acceptor = new NioSocketAcceptor();
        acceptor.getSessionConfig().setReadBufferSize(2048);
        acceptor.getSessionConfig().setIdleTime(IdleStatus.BOTH_IDLE, 10);
        // 设置日志记录器
        acceptor.getFilterChain().addLast("logger", new LoggingFilter());
        // 设置编码过滤器
        acceptor.getFilterChain().addLast(
                "codec",
                new ProtocolCodecFilter(new TextLineCodecFactory(Charset.forName("UTF-8"))));
        // 指定业务逻辑处理器
        acceptor.setHandler(handler);
        SocketSessionConfig config = (SocketSessionConfig) acceptor.getSessionConfig
                ();
        config.setReuseAddress(true);

        // 设置端口号
        acceptor.bind(new InetSocketAddress(port));
        // 启动监听线程
        acceptor.bind();

    }


    public void sendToRobot(SimpleKeyEvent keyEvent) {
        Message<KeyEvent> eventMessage=new Message<KeyEvent>();
        sendToRobot(JSONUtil.toJson(eventMessage.setType("KEY_EVENT").setBody(keyEvent)));
    }

    private void sendToRobot(String s) {
        if (sessionSet != null) {
            for (IoSession session : sessionSet) {
                session.write(s);
            }
        }
    }
}