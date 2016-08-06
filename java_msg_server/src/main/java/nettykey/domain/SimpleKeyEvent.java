package nettykey.domain;

/**
 * Created by yongliuli on 8/6/16.
 */
public class SimpleKeyEvent {
    public final static int EVENT_PRESS = 1;
    public final static int EVENT_RELEASE = 0;

    private int keyChar;
    private int keyCode;
    private int eventCode;

    public int getKeyChar() {
        return keyChar;
    }

    public SimpleKeyEvent setKeyChar(char keyChar) {
        this.keyChar = keyChar;
        return this;
    }

    public int getKeyCode() {
        return keyCode;
    }

    public SimpleKeyEvent setKeyCode(int keyCode) {
        this.keyCode = keyCode;
        return this;
    }

    public int getEventCode() {
        return eventCode;
    }

    public SimpleKeyEvent setEventCode(int eventCode) {
        this.eventCode = eventCode;
        return this;
    }
}
