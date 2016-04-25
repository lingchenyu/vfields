---
layout: post
title: swt的Text输入数字(包括负数和小数) 
description: swt的Text组件输入数字（包括小数和负数）
categories: Java
icon: code
---
&nbsp;&nbsp; 最终效果图如下：

<img src="/images/20141207/swt-num-text01.png" alt="swt-text运行效果图"/>

&nbsp;&nbsp; 代码：

<div class="article_content">
<textarea name="code" class="java" >
import org.eclipse.swt.SWT;
import org.eclipse.swt.events.ModifyEvent;
import org.eclipse.swt.events.ModifyListener;
import org.eclipse.swt.events.VerifyEvent;
import org.eclipse.swt.events.VerifyListener;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.swt.widgets.Text;
 
public class SWTNumberText {
 
	private Shell shell;
 
	private Text text1;
	private Text text2;
 
	/**
	 * 初始化各种组件
	 */
	public void open() {
		Display display = new Display();
		shell = new Shell(display);

		// 初始化监听器
		ModifyListener modifyListener = new ModifyListener() {
			@Override
			public void modifyText(ModifyEvent e) {
				String textStr = ((Text) e.widget).getText();
				if (textStr == null || textStr.equals("")) {
					return;
				}

				if (textStr.equals("-") || textStr.startsWith(".") || textStr.endsWith(".") || textStr.startsWith("-.")) {
					return;
				}

				// 注意,这里是可以进行其它操作的地方
				// 如果能顺利通过前面的判断,那输入已合法,可以进行一些相应的操作,比如读取内容进行计算
				// 暂时只是将两个数相乘
				System.err.println(Double.parseDouble(text1.getText()) * Double.parseDouble(text2.getText()));
			}
		};

		VerifyListener verifyListener = new VerifyListener() {

			@Override
			public void verifyText(VerifyEvent event) {
				// 允许"backspace"和"delete"进行删除
				if (event.keyCode == SWT.BS || event.keyCode == SWT.DEL) {
					event.doit = true;
					return;
				}
				event.doit = false;
				char myChar = event.character;
				Text text = (Text) event.widget;
				String textStr = text.getText();
				if (myChar == '-') {
					if (textStr.indexOf("-") == -1) {
						if (event.start == 0) {
							event.doit = true;
						}
					}
				} else if (myChar == '.') {
					if (textStr.indexOf(".") == -1) {
						if (event.start != 0) {
							event.doit = true;
						}
					}
				} else {
					// 其余的只能输入数字
					if ((myChar >= '0' && myChar <= '9')) {
						event.doit = true;
					}
				}
			}
		};

		shell.setLayout(new GridLayout(2, false));

		new Label(shell, SWT.NONE).setText("标签1");
		text1 = new Text(shell, SWT.NONE);// 这里各种外观自己控制
		text1.setText("1");
		GridData gridData = new GridData(GridData.HORIZONTAL_ALIGN_FILL | GridData.VERTICAL_ALIGN_FILL);
		gridData.grabExcessHorizontalSpace = true;
		gridData.grabExcessVerticalSpace = true;
		text1.setLayoutData(gridData);

		new Label(shell, SWT.NONE).setText("标签2");
		text2 = new Text(shell, SWT.NONE);// 这里各种外观自己控制
		text2.setText("2");
		gridData = new GridData(GridData.HORIZONTAL_ALIGN_FILL | GridData.VERTICAL_ALIGN_FILL);
		gridData.grabExcessHorizontalSpace = true;
		gridData.grabExcessVerticalSpace = true;
		text2.setLayoutData(gridData);

		// 添加监听器
		text1.addVerifyListener(verifyListener);
		text1.addModifyListener(modifyListener);

		text2.addVerifyListener(verifyListener);
		text2.addModifyListener(modifyListener);

		shell.setSize(200, 100);

		shell.open();
	}
 
	public void run() {
		Display display = shell.getDisplay();
		while (!shell.isDisposed()) {
			if (!display.readAndDispatch())
				display.sleep();
		}
	}
 
	public static void main(String[] args) {
		SWTNumberText swtNumberText = new SWTNumberText();
		swtNumberText.open();
		swtNumberText.run();
	}
 
}
</textarea>
</div>

&nbsp;&nbsp; 上面的例子中，<code>swt</code>的<code>text</code>可以及时监听输入。注意：这里有一个前提，就是每一个<code>text</code>要有默认值，或者在计算的时候自己去判断 <code>getText()</code>为空。这里为了简便，就不判空。

<div class="alert-box warning"><span>注意</span><br/><code>Text</code>加了监听器之后，直接调用<code>setText()</code>方法会有问题，拿到一个空值，所以在<code>setText()</code>之前，要先remove掉这两个监听器，在<code>setText()</code>之后，再添加回来。像下面：</div>

<div class="article_content">
<textarea name="code" class="java" >
// 先移除监听
text1.removeVerifyListener(verifyListener);
text1.removeModifyListener(modifyListener);
// 然后设置值
text1.setText("1111");
// 最后再添加监听器
text1.addVerifyListener(verifyListener);
text1.addModifyListener(modifyListener);
</textarea>
</div>


&nbsp;&nbsp; 上面这一段代码看上去挺奇怪，又移除又添加的，但其实仔细一想就很容易明白，监听器监听的其实是用户的输入，而用户的输入每次都会被监听，所以如果你能确信自己set进去的内容没有问题，就应该把监听器拿掉，要不然监听器也会对<code>setText()</code>的内容进行监听。但由于<code>setText()</code>一次搞进去一个字符串，监听器好像会有点问题，具体的细节我没有去深究，-_-!先酱紫用着了
