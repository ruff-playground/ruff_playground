package nettykey.domain;

/**
 * Created by yongliuli on 8/6/16.
 */
public class Message<T> {
    private String type;
    private T body;

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
}
