var BASE64ENCODER_KEYSTRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + //all caps
							  "abcdefghijklmnopqrstuvwxyz" + //all lowercase
							  "0123456789+/"; // all numbers plus +/

var BASE64ENCODER_KEYARRAY = BASE64ENCODER_KEYSTRING.split("");

var BASE64ENCODER_INVERSEKEYARRAY = {};
for ( var i = 0, length = BASE64ENCODER_KEYARRAY.length; i < length; i++)
{
	BASE64ENCODER_INVERSEKEYARRAY[BASE64ENCODER_KEYARRAY[i]] = i; 
}

var BASE64ENCODER_KEYEXPRESSION = new RegExp("[^"+BASE64ENCODER_KEYSTRING+"]", "g");

var BASE64ENCODER_SINGLEBYTETEST = new RegExp("^[\\x00-\\x7F]*$", "g");

var BASE64ENCODER_MULTIBYTE_CHARACTER = new RegExp("[^\\x00-\\x7F]", "g");

var fqnFromCharCode = String.fromCharCode;

function Base64Encoder()
{
}

// This function does the encoding.
Base64Encoder.prototype.encode = function (string)
{
	if (!string) return "";
	// In case the string contains multibyte characters, first encode to UTF8.
	if ( !BASE64ENCODER_SINGLEBYTETEST.test(string) )
	{
		string = Base64Encoder_utf8_encode(string);
	}
	// the result/encrypted string, the padding string, and the pad count
	var p = "";
	var length = string.length;
	var c = length % 3;

	// add a right zero pad to make this string a multiple of 3 characters
	if ( c > 0 )
	{
		var paddingArray = [];
		var paddingIndex = 0;
		for (; c < 3; c++)
		{
			paddingArray[paddingIndex++] = "=";
			string += "\0";
		}
		p = paddingArray.join("");
	}

	// increment over the length of the string, three characters at a time
	var result = "";
	var resultArray = [];
	var resultIndex = n = c = 0;
	length = string.length;
	do
	{
		// we add newlines after every 76 output characters, according to the MIME specs
		if ( c > 0 && (c / 3 * 4) % 76 == 0 ) 
		{
			resultArray[resultIndex++] = "\r\n";
		}

		// these three 8-bit (ASCII) characters become one 24-bit number
		n = (string.charCodeAt(c) << 16) + (string.charCodeAt(c+1) << 8) + string.charCodeAt(c+2);

		// this 24-bit number gets separated into four 6-bit numbers
		n = [(n >>> 18) & 63, (n >>> 12) & 63, (n >>> 6) & 63, n & 63];

		// those four 6-bit numbers are used as indices into the base64 character list
		resultArray[resultIndex++] = BASE64ENCODER_KEYARRAY[n[0]];
		resultArray[resultIndex++] = BASE64ENCODER_KEYARRAY[n[1]];
		resultArray[resultIndex++] = BASE64ENCODER_KEYARRAY[n[2]];
		resultArray[resultIndex++] = BASE64ENCODER_KEYARRAY[n[3]];
	}
	while ( (c += 3) < length )
	result = resultArray.join(""); 
	resultArray = null;
	// add the actual padding string, after removing the zero pad
	if ( p ) { result = result.substring(0, result.length - p.length) + p; }
	return result;
}

// This function returns a version of the UTF-8 source string where high-order (non-ASCII)
// characters have been converted into a sequence of "character bytes". The resulting
// string can be base64 encoded using the encode routine in this library, which normally 
// only accept ASCII encodings.
function Base64Encoder_utf8_encode(string)
{
	var utf8String = string.split("");
	var c = i = result = BASE64ENCODER_MULTIBYTE_CHARACTER.lastIndex = 0;
	while ( (result = BASE64ENCODER_MULTIBYTE_CHARACTER.exec(string) ) != null )
	{
		i = result.index;
		c = utf8String[i].charCodeAt(0);
		// for all non plain characters.
		if ( c < 2048 )
		{
			// Two bytes. This includes Latin letters with diacritics and characters from Greek, Cyrillic, Coptic, Armenian, 
			// Hebrew, Arabic, Syriac and Tana alphabets.
			// First character byte begins with 110, the second begins with 10.
			utf8String[i] = fqnFromCharCode((c >> 6) | 192) + 
							fqnFromCharCode((c & 63) | 128);
		}
		else if ( c < 65536 )
		{
			// Three bytes are needed for the rest of the Basic Multilingual Plane (which contains virtually all characters in common use).
			// First character byte begins with 1110, both the second and third character bytes begin with 10.
			utf8String[i] = fqnFromCharCode((c >> 12) | 224) + 
							fqnFromCharCode(((c >> 6) & 63) | 128) + 
							fqnFromCharCode((c & 63) | 128);
			
		}
		else if ( c < 2097152 )
		{
			//Four bytes are needed for characters in the other planes of Unicode, which are rarely used in practice.
			utf8String[i] = fqnFromCharCode((c >> 18) | 240) + 
							fqnFromCharCode(((c >> 12) & 63) | 128) + 
							fqnFromCharCode(((c >> 6) & 63) | 128) + 
							fqnFromCharCode((c & 63) | 128);
		}
	}
	return utf8String.join("");
}

// This function does the decoding
Base64Encoder.prototype.decode = function (string)
{
	if (!string) return "";
	var length = string.length;
	// replace any incoming padding with a zero pad (the 'A' character is zero)
	var p = (string.charAt(length-1) == "=" ? (string.charAt(length-2) == "=" ? "AA" : "A") : ""); 
	if ( p ) { string = string.substr(0, length - p.length) + p; }

	// remove/ignore any characters not in the base64 characters list -- particularly newlines
	if ( BASE64ENCODER_KEYEXPRESSION.exec(string) != null ) 
	{
		//Do some error checking
		application.spy("There were invalid base64 characters in the input text.\n" +
		"Valid base64 characters are A-Z, a-z, 0-9, '+' and '/'\n" +
		"Expect errors in decoding.");
	}
	string = string.replace(BASE64ENCODER_KEYEXPRESSION, "");
	
	var result = "";
	var resultArray = [];
	var resultIndex = 0;
	// increment over the length of this encrypted string, four characters at a time
	length = string.length;
	var c = n = 0;
	do
	{
		// each of these four characters represents a 6-bit index in the base64 characters list
		//  which, when concatenated, will give the 24-bit number for the original 3 characters
		n = ( BASE64ENCODER_INVERSEKEYARRAY[string.charAt(c)] << 18 ) + 
			   BASE64ENCODER_INVERSEKEYARRAY[string.charAt(c+3)] +
			 ( BASE64ENCODER_INVERSEKEYARRAY[string.charAt(c+1)] << 12 ) + 
			 ( BASE64ENCODER_INVERSEKEYARRAY[string.charAt(c+2)] << 6 );

		// split the 24-bit number into the original three 8-bit (ASCII) characters
		resultArray[resultIndex++] = fqnFromCharCode((n >>> 16) & 255, (n >>> 8) & 255, n & 255);
	}
	while ( (c += 4) < length )
	result = resultArray.join("");
	resultArray = null;
	// remove any zero pad that was added to make this a multiple of 24 bits
	if ( p ) { result = result.substring(0, result.length - p.length); }
	// In case the string was containing multibyte characters, decode from UTF8.
	if ( ! BASE64ENCODER_SINGLEBYTETEST.test(result) )
	{
		return Base64Encoder_utf8_decode(result);
	}
	return result;
}

// This function does the UTF-8 decoding taking a string previously encoded with the Base64Encoder_utf8_encode 
// method above and returns the original (pre-encoded) string.
function Base64Encoder_utf8_decode(utf8String)
{
	var string = utf8String.split("");
	var c = i = result = BASE64ENCODER_MULTIBYTE_CHARACTER.lastIndex = 0;
	while ( (result = BASE64ENCODER_MULTIBYTE_CHARACTER.exec(utf8String) ) != null )
	{
		i = result.index;
		c = string[i].charCodeAt(0);
		if ( c < 224 )
		{
			string[i]= fqnFromCharCode(((c & 63) << 6) | ((string[i+1]||"").charCodeAt(0) & 63));
			string[++i] = "";
		}
		else if ( c < 240 )
		{
			string[i] = fqnFromCharCode(((c & 31) << 12) | (((string[i+1]||"").charCodeAt(0) & 63) << 6) | ((string[i+2]||"").charCodeAt(0) & 63));
			string[++i] = string[++i] = "";
		}
		else
		{
			string[i] = fqnFromCharCode(((c & 15) << 18) | (((string[i+1]||"").charCodeAt(0) & 63) << 12) | (((string[i+2]||"").charCodeAt(0) & 63) << 6) | ((string[i+3]||"").charCodeAt(0) & 63));
			string[++i] = string[++i] = string[++i] = "";
		}
		BASE64ENCODER_MULTIBYTE_CHARACTER.lastIndex = ++i;
	}
	return string.join("");
}
