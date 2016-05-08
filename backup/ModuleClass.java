package com.bigao.tool.core.message;

import com.thoughtworks.qdox.model.JavaClass;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by wait on 2016/5/7.
 */
public class ModuleClass {
    private JavaClass module;
    private Map<JavaClass, MessageClass> function = new LinkedHashMap<>();

    public static ModuleClass valueOf(JavaClass module) {
        ModuleClass moduleClass = new ModuleClass();
        moduleClass.module = module;
        return moduleClass;
    }

    public JavaClass getModule() {
        return module;
    }

    public void setModule(JavaClass module) {
        this.module = module;
    }

    public Map<JavaClass, MessageClass> getFunction() {
        return function;
    }

    public void setFunction(Map<JavaClass, MessageClass> function) {
        this.function = function;
    }


    @Override
    public String toString() {
        return "ModuleClass{" +
                "function=" + function +
                ", module=" + module +
                '}';
    }
}
