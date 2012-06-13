package com.cordys.app;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class CordysPhoneGapTestActivity extends DroidGap {
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		String incommingPath = getIntent().getDataString();
		
		if (null != incommingPath)
			super.loadUrl("file:///android_asset/www/index.html?url=" + incommingPath);
		else
			super.loadUrl("file:///android_asset/www/index.html");
		
		
		
	}
	
	
	
	
}