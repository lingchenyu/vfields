package com.bigao.tool.core.message;

import com.google.common.collect.Lists;
import com.thoughtworks.qdox.model.JavaClass;

import java.util.List;

/**
 * Created by wait on 2016/5/7.
 */
public class MessageClass {
    private JavaClass req;
    private JavaClass suc;
    private JavaClass fail;
    private List<JavaClass> beanClass = Lists.newArrayList();

    public static MessageClass valueOf() {
        return new MessageClass();
    }

    public JavaClass getFail() {
        return fail;
    }

    public void setFail(JavaClass fail) {
        this.fail = fail;
    }

    public JavaClass getReq() {
        return req;
    }

    public void setReq(JavaClass req) {
        this.req = req;
    }

    public JavaClass getSuc() {
        return suc;
    }

    public void setSuc(JavaClass suc) {
        this.suc = suc;
    }

    public List<JavaClass> getBeanClass() {
        return beanClass;
    }

    public void setBeanClass(List<JavaClass> beanClass) {
        this.beanClass = beanClass;
    }


    @Override
    public String toString() {
        return "MessageClass{" +
                "beanClass=" + beanClass +
                ", req=" + req +
                ", suc=" + suc +
                ", fail=" + fail +
                '}';
    }
}
