package com.academia.server.models;

public class EncryptedRequest {
    private String key = "";
    private String iv = "";
    private String payload = "";

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
}