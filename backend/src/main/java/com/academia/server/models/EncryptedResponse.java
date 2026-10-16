package com.academia.server.models;

public class EncryptedResponse {
    private String iv = "";
    private String payload = "";

    public EncryptedResponse() {}
    public EncryptedResponse(String iv, String payload) {
        this.iv = iv;
        this.payload = payload;
    }

    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
}