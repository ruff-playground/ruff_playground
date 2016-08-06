package nettykey.minaserver;

import org.apache.mina.core.session.IoSession;

/**
 * Created by yongliuli on 8/6/16.
 */
public interface SessionHandler {
    void sessionOpened(IoSession ioSession);
    void sessionClosed(IoSession ioSession);
}
