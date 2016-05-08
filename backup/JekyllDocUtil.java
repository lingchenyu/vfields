package com.bigao.tool.core;

import com.bigao.tool.core.message.MessageClass;
import com.bigao.tool.core.message.ModuleClass;
import com.google.common.collect.Lists;
import com.google.googlejavaformat.java.Formatter;
import com.google.googlejavaformat.java.FormatterException;
import com.thoughtworks.qdox.JavaProjectBuilder;
import com.thoughtworks.qdox.model.JavaClass;
import com.thoughtworks.qdox.model.JavaField;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.nio.file.Files.list;

/**
 * 生成jekyll的doc
 * Created by wait on 2016/5/7.
 */
public class JekyllDocUtil {

    public static void main(String[] args) throws Exception {
        docToMarkdown();
    }

    public static void docToMarkdown() throws Exception {
        String currentDir = System.getProperty("user.dir");
        String src = currentDir + "/tool/src/main/java/com/bigao/tool/module/message";// 源码目录

        JavaProjectBuilder projectBuilder = new JavaProjectBuilder();
        list(Paths.get(src)).forEach(f -> {
            try {
                projectBuilder.addSource(f.toFile());
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        Collection<JavaClass> allClasses = projectBuilder.getClasses();
        List<ModuleClass> allMessage = Lists.newArrayList();
        for (JavaClass javaClass : allClasses) {
            if (javaClass.getAnnotations().isEmpty()) {
                continue;
            }
            ModuleClass moduleClass = ModuleClass.valueOf(javaClass);
            allMessage.add(moduleClass);
            for (JavaClass mClass : javaClass.getNestedClasses()) {
                MessageClass messageClass = MessageClass.valueOf();
                moduleClass.getFunction().put(mClass, messageClass);
                for (JavaClass iClass : mClass.getNestedClasses()) {
                    if (iClass.getName().equals("Bean")) {
                        continue;
                    }
                    String[] cNames = iClass.getCanonicalName().split("\\.");
                    if (cNames[cNames.length - 2].equals("Bean")) {
                        messageClass.getBeanClass().add(iClass);
                        continue;
                    }
                    switch (iClass.getName()) {
                        case "Req":
                            messageClass.setReq(iClass);
                            break;
                        case "Fail":
                            messageClass.setFail(iClass);
                            break;
                        case "Succ":
                            messageClass.setSuc(iClass);
                            break;
                    }
                }
            }
        }
        String dist = "D:\\gitcode\\haojianzong.github.io";
        allMessage.stream().forEach(m -> {
            try {
                toMarkdownFile(dist + "\\_posts", m);
            } catch (IOException | FormatterException e) {
                e.printStackTrace();
            }
        });
        String[] commands = new String[]{
                "cmd.exe",
                "/C",
                "D:&&cd " + dist + "&&jekyll build"
        };
        Runtime rt = Runtime.getRuntime();
        Process process = rt.exec(commands);

        PackUtil.StreamGobbler errorGobbler = new PackUtil.StreamGobbler(process.getErrorStream(), "ERROR");
        PackUtil.StreamGobbler outputGobbler = new PackUtil.StreamGobbler(process.getInputStream(), "");

        errorGobbler.start();
        outputGobbler.start();

        int exitVal = process.waitFor();
        if (exitVal != 0) {
            throw new RuntimeException("jekyll build出错");
        }
        process.destroy();
    }

    private static String sep = System.getProperty("line.separator");

    private static String wrapComment(String data) {
        if (StringUtils.isBlank(data)) {
            return StringUtils.EMPTY;
        }
        if (data.contains("[")) {
            data = data.replaceAll("\\[", "&#91;");
            data = data.replaceAll("]", "&#93;");
        }
        if (data.contains("</p>")) {
            data = data.replaceAll("<p>", "");
            data = data.replaceAll("</p>", sep);
        }
        return data;
    }

    private static String wrapJavaType(JavaClass javaClass) {
        return javaClass.getGenericCanonicalName().replace("com.bigao.tool.module.message.", "");
    }

    private static void toMarkdownFile(String dst, ModuleClass moduleClass) throws IOException, FormatterException {
        // 因为文件以日期开头,这里额外检测文件是否存在
        String moduleFileName = moduleClass.getModule().getName().toLowerCase() + ".md";
        List<String> exits = Files.list(Paths.get(dst)).filter(c -> c.getFileName().toString().endsWith(moduleFileName)).map(c -> c.getFileName().toString()).collect(Collectors.toList());
        String fileName = exits.isEmpty() ? LocalDate.now().toString() + "-" + moduleFileName : exits.get(0);
        JavaClass module = moduleClass.getModule();
        StringBuilder builder = new StringBuilder();
        builder.append("---").append(sep);
        builder.append("layout: post").append(sep);
        builder.append("title: ").append("\"").append(module.getName()).append("\"").append(sep);
        builder.append("comment: ");
        if (StringUtils.isBlank(module.getComment())) {
            builder.append(module.getName());
        } else {
            String comment = StringUtils.trim(module.getComment());
            comment = comment.replaceAll("(?i)<br */?>", "");
            if (comment.contains("\n")) {
                comment = comment.split("\n")[0];
            }
            if (comment.length() > 10) {
                comment = comment.substring(0, 10);
            }
            builder.append(comment);
        }
        builder.append(sep);
        builder.append("categories: doc").append(sep);// 只设置doc目录
        builder.append("---").append(sep).append(sep);
        if (StringUtils.isNotBlank(module.getComment())) {
            builder.append("{% highlight txt %}");
            builder.append(wrapComment(module.getComment()));
            builder.append("{% endhighlight %}").append(sep);
        }
        for (Map.Entry<JavaClass, MessageClass> entry : moduleClass.getFunction().entrySet()) {
            if (entry.getKey().getName().equals("Bean") && entry.getValue().getBeanClass().isEmpty()) {
                continue;
            }
            JavaClass keyClass = entry.getKey();
            System.err.println(keyClass.getCanonicalName());
            builder.append("<h2 id=\"").append(keyClass.getName().toLowerCase()).append("\" class=\"text-big-title\">");
            builder.append(wrapComment(entry.getKey().getComment()));
            builder.append("(").append(keyClass.getName()).append(")").append(sep);
            builder.append("</h2>");
            MessageClass messageClass = entry.getValue();
            builder.append("<div class=\"article_content\">").append(sep).append("<textarea name=\"dp-code\" class=\"java\" >").append(sep);
            StringBuilder codeBuilder = new StringBuilder();
            if (messageClass.getReq() != null) {
                JavaClass reqClass = messageClass.getReq();
                codeBuilder.append("/** ").append(wrapComment(reqClass.getComment())).append(" */").append(sep);
                codeBuilder.append(" class ").append(reqClass.getName()).append(module.getName()).append(keyClass.getName()).append("{").append(sep);
                for (JavaField field : reqClass.getFields()) {
                    codeBuilder.append("/** ").append(wrapComment(field.getComment())).append(" */").append(sep);
                    codeBuilder.append(wrapJavaType(field.getType())).append(" ").append(field.getName()).append(";").append(sep);
                }
                codeBuilder.append(" }").append(sep).append(sep);
            }
            if (messageClass.getSuc() != null) {
                JavaClass sucClass = messageClass.getSuc();
                if (StringUtils.isNotBlank(sucClass.getComment())) {
                    codeBuilder.append("/** ").append(wrapComment(sucClass.getComment())).append(" */").append(sep);
                }
                codeBuilder.append(" class Res").append(module.getName()).append(keyClass.getName()).append("{").append(sep);
                for (JavaField field : sucClass.getFields()) {
                    codeBuilder.append("/** ").append(wrapComment(field.getComment())).append(" */").append(sep);
                    codeBuilder.append(wrapJavaType(field.getType())).append(" ").append(field.getName()).append(";").append(sep);
                }
                codeBuilder.append(" }").append(sep).append(sep);
            }
            if (messageClass.getFail() != null) {
                JavaClass failClass = messageClass.getFail();
                if (StringUtils.isNotBlank(failClass.getComment())) {
                    codeBuilder.append("/** ").append(wrapComment(failClass.getComment())).append(" */").append(sep);
                }
                codeBuilder.append(" class Res").append(module.getName()).append(keyClass.getName()).append("Fail").append("{").append(sep);
                for (JavaField field : failClass.getFields()) {
                    codeBuilder.append("/** ").append(wrapComment(field.getComment())).append(" */").append(sep);
                    codeBuilder.append(wrapJavaType(field.getType())).append(" ").append(field.getName()).append(";").append(sep);
                }
                codeBuilder.append(" }").append(sep).append(sep);
            }
            if (!messageClass.getBeanClass().isEmpty()) {
                for (JavaClass beanClass : messageClass.getBeanClass()) {
                    if (StringUtils.isNotBlank(beanClass.getComment())) {
                        codeBuilder.append("/** ").append(wrapComment(beanClass.getComment())).append(" */").append(sep);
                    }
                    codeBuilder.append(" class ").append(beanClass.getName()).append("{").append(sep);
                    for (JavaField field : beanClass.getFields()) {
                        codeBuilder.append("/** ").append(wrapComment(field.getComment())).append(" */").append(sep);
                        codeBuilder.append(wrapJavaType(field.getType())).append(" ").append(field.getName()).append(";").append(sep);
                    }
                    codeBuilder.append(" }").append(sep).append(sep);
                }
            }
            if (codeBuilder.length() > 0) {
                String formatCode = new Formatter().formatSource(codeBuilder.toString());
                formatCode = formatCode.replaceAll("<", "&lt;");
                formatCode = formatCode.replaceAll(">", "&gt;");
                builder.append(formatCode);
            }
            builder.append("</textarea>").append(sep).append("</div>").append(sep).append(sep);
        }
        Files.write(Paths.get(dst, fileName), builder.toString().getBytes(), StandardOpenOption.TRUNCATE_EXISTING);
    }

}
