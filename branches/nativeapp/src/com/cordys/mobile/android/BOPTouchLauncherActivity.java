package com.cordys.mobile.android;

import org.apache.cordova.DroidGap;

import android.net.Uri;
import android.os.Bundle;

public class BOPTouchLauncherActivity extends DroidGap {
	
	/** 
	 * Called when the activity is first created. 
	 */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		Uri data = getIntent().getData();
		
		String url = "file:///android_asset/www/index.html";
		
		if (null != data) {
			url += "?" + data.getQuery();
		}
		
		System.out.print("url: " + url);
		
		super.loadUrl(url);
	}
}