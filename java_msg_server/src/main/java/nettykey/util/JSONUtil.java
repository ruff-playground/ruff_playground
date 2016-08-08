package nettykey.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;

import java.io.IOException;

/**
 * Created by yongliuli on 8/6/16.
 */
public class JSONUtil {
    static ObjectMapper objectMapper = new ObjectMapper();

    public static <T> String toJson(T object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return "";
    }

    public static  <T> T parse(String string) {
        try {
            return objectMapper.reader().readValue(string);

        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
    public static JsonNode readTree(String str){
        try {
            return objectMapper.reader().readTree(str);
        } catch (IOException e) {
            return NullNode.getInstance();
        }
    }

}
