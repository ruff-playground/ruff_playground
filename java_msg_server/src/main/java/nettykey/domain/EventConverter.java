package nettykey.domain;

import java.awt.event.KeyEvent;

/**
 * Created by yongliuli on 8/6/16.
 */
public class EventConverter {
    public static SimpleKeyEvent toSimpleKeyEvent(KeyEvent event, int eventCode) {
        return new SimpleKeyEvent().setKeyCode(event.getKeyCode()).setEventCode(eventCode).setKeyChar(event.getKeyChar());
    }
}
