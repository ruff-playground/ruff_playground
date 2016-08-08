package nettykey.domain;

/**
 * Created by yongliuli on 8/6/16.
 */
public class SpeedChangeEvent {


    private double x;
    private double y;

    public double getX() {
        return x;
    }

    public SpeedChangeEvent setX(double x) {
        this.x = x;
        return this;
    }

    public double getY() {
        return y;
    }

    public SpeedChangeEvent setY(double y) {
        this.y = y;
        return this;
    }
}
