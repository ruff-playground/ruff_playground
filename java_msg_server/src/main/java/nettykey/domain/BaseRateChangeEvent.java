package nettykey.domain;

/**
 * Created by yongliuli on 8/6/16.
 */
public class BaseRateChangeEvent {
    private double baseRate;

    public double getBaseRate() {
        return baseRate;
    }

    public BaseRateChangeEvent setBaseRate(double baseRate) {
        this.baseRate = baseRate;
        return this;
    }
}
