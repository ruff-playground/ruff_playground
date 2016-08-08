package nettykey.domain;

/**
 * Created by yongliuli on 8/6/16.
 */
public class Message<T> {
    private String type;
    private T body;
    public static String KEY_EVENT = "KEY_EVENT";
    public static String SPEED_CHANGE = "SPEED_CHANGE";
    public static String BASE_RATE_CHANGE = "BASE_RATE_CHANGE";

    public String getType() {
        return type;
    }

    public Message setType(String type) {
        this.type = type;
        return this;
    }

    public T getBody() {
        return body;
    }

    public Message setBody(T body) {
        this.body = body;
        return this;
    }

    public static Message<SimpleKeyEvent> simpleKeyEventMessage(int keyCode, int eventCode) {
        return new Message<SimpleKeyEvent>().setType(KEY_EVENT)
                .setBody(new SimpleKeyEvent().setEventCode(eventCode).setKeyCode(keyCode));
    }

    public static Message<SpeedChangeEvent> speedChangeEventMessage(double x, double y) {
        return new Message<SpeedChangeEvent>().setType(SPEED_CHANGE)
                .setBody(new SpeedChangeEvent().setX(x).setY(y));
    }
    public static Message<BaseRateChangeEvent> baseRateChangeEventMessage(double rate) {
        return new Message<SpeedChangeEvent>().setType(BASE_RATE_CHANGE)
                .setBody(new BaseRateChangeEvent().setBaseRate(rate));
    }
}
