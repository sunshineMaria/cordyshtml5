package com.cordys.app;

import org.apache.cordova.DroidGap;

import android.net.Uri;
import android.os.Bundle;

public class CordysPhoneGapTestActivity extends DroidGap {
	
	/** 
	 * Called when the activity is first created. 
	 */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		Uri data = getIntent().getData();
		
		String url = "file:///android_asset/www/index.html";
		
		url += null == data
			? ""
			: "?" + data.getQuery();
		
		super.loadUrl(url);
	}
}