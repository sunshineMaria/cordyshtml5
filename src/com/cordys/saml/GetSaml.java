package com.cordys.saml;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

//import javax.net.ssl.HostnameVerifier;
//import javax.net.ssl.HttpsURLConnection;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.http.HttpVersion;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
//import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.apache.http.impl.client.DefaultHttpClient;
//import org.apache.http.impl.conn.SingleClientConnManager;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.json.JSONArray;

public class GetSaml extends Plugin {

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {

		if (!action.equals("GetSaml") || args.length() < 1) {
			return new PluginResult(PluginResult.Status.INVALID_ACTION);
		}

		
		
		/*HostnameVerifier hostnameVerifier = org.apache.http.conn.ssl.SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER;

		DefaultHttpClient client = new DefaultHttpClient();

		SchemeRegistry registry = new SchemeRegistry();
		SSLSocketFactory socketFactory = SSLSocketFactory.getSocketFactory();
		socketFactory
				.setHostnameVerifier((X509HostnameVerifier) hostnameVerifier);
		registry.register(new Scheme("https", socketFactory, 443));
		SingleClientConnManager mgr = new SingleClientConnManager(
				client.getParams(), registry);
		
		client = new DefaultHttpClient(mgr,
				client.getParams());

		// Set verifier
		HttpsURLConnection.setDefaultHostnameVerifier(hostnameVerifier);
*/
		try {
			DefaultHttpClient client = getClient();
			
			
			
			HttpPost request = new HttpPost(
					"https://ec2-50-17-207-217.compute-1.amazonaws.com/cordys//cordys/com.eibus.web.soap.Gateway.wcp");
			
			
			// Get the response
			BufferedReader rd = new BufferedReader(new InputStreamReader(client.execute(request).getEntity()
						.getContent()));
			
			StringBuilder result = new StringBuilder();
			String line;
			
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}

			if (null != rd) {
				try {
					rd.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			
			System.out.println(result.toString());
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return new PluginResult(PluginResult.Status.OK);//i.hasExtra(extraName));
	}
	
	
	public DefaultHttpClient getClient() {
        DefaultHttpClient ret = null;

        //sets up parameters
        HttpParams params = new BasicHttpParams();
        HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
        HttpProtocolParams.setContentCharset(params, "utf-8");
        params.setBooleanParameter("http.protocol.expect-continue", false);

        //registers schemes for both http and https
        SchemeRegistry registry = new SchemeRegistry();
        registry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));
        final SSLSocketFactory sslSocketFactory = SSLSocketFactory.getSocketFactory();
        sslSocketFactory.setHostnameVerifier(SSLSocketFactory.BROWSER_COMPATIBLE_HOSTNAME_VERIFIER);
        registry.register(new Scheme("https", sslSocketFactory, 443));

        ThreadSafeClientConnManager manager = new ThreadSafeClientConnManager(params, registry);
        ret = new DefaultHttpClient(manager, params);
        return ret;
    }

}