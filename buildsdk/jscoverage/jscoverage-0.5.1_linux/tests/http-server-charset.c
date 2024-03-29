/*
    http-server-charset.c - HTTP server that outputs different charset values
    Copyright (C) 2008, 2009, 2010 siliconforks.com

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

#include <config.h>

#include <assert.h>
#include <string.h>

#include "http-server.h"
#include "stream.h"
#include "util.h"

int main(void) {
#ifdef __MINGW32__
  WSADATA data;
  if (WSAStartup(MAKEWORD(1, 1), &data) != 0) {
    return 1;
  }
#endif

  SOCKET s = socket(PF_INET, SOCK_STREAM, 0);
  assert(s != INVALID_SOCKET);

  int optval = 1;
  setsockopt(s, SOL_SOCKET, SO_REUSEADDR, (const char *) &optval, sizeof(optval));

  struct sockaddr_in a;
  a.sin_family = AF_INET;
  a.sin_port = htons(8000);
  a.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  int result = bind(s, (struct sockaddr *) &a, sizeof(a));
  assert(result == 0);

  result = listen(s, 5);
  assert(result == 0);

  for (;;) {
    struct sockaddr_in client_address;
    size_t size = sizeof(client_address);
    int client_socket = accept(s, (struct sockaddr *) &client_address, &size);
    assert(client_socket > 0);

    /* read request */
    Stream * stream = Stream_new(0);
    int state = 0;
    while (state != 2) {
      uint8_t buffer[8192];
      ssize_t bytes_read = recv(client_socket, buffer, 8192, 0);
      assert(bytes_read > 0);
      Stream_write(stream, buffer, bytes_read);
      for (int i = 0; i < bytes_read && state != 2; i++) {
        uint8_t byte = buffer[i];
        switch (state) {
        case 0:
          if (byte == '\n') {
            state = 1;
          }
          break;
        case 1:
          if (byte == '\n') {
            state = 2;
          }
          else if (byte == '\r') {
            state = 1;
          }
          else {
            state = 0;
          }
          break;
        }
      }
    }

    char * method;
    char * url;
    char * request_line = (char *) stream->data;
    char * first_space = strchr(request_line, ' ');
    assert(first_space != NULL);
    char * second_space = strchr(first_space + 1, ' ');
    assert(second_space != NULL);
    method = xstrndup(request_line, first_space - request_line);
    url = xstrndup(first_space + 1, second_space - (first_space + 1));

    /* send response */
    char * message;
    if (strcmp(url, "http://127.0.0.1:8000/utf-8.js") == 0 || strcmp(url, "/utf-8.js") == 0) {
      message = "HTTP/1.1 200 OK\r\n"
                "Connection: close\r\n"
                "Content-type: text/javascript; charset=UTF-8\r\n"
                "\r\n"
                "var s = 'eèéê';\n"
                "var r = /eèéê/;\n";
    }
    else if (strcmp(url, "http://127.0.0.1:8000/iso-8859-1.js") == 0 || strcmp(url, "/iso-8859-1.js") == 0) {
      message = "HTTP/1.1 200 OK\r\n"
                "Connection: close\r\n"
                "Content-type: text/javascript; charset=ISO-8859-1\r\n"
                "\r\n"
                "var s = 'e���';\n"
                "var r = /e���/;\n";
    }
    else if (strcmp(url, "http://127.0.0.1:8000/bogus.js") == 0 || strcmp(url, "/bogus.js") == 0) {
      message = "HTTP/1.1 200 OK\r\n"
                "Connection: close\r\n"
                "Content-type: text/javascript; charset=BOGUS\r\n"
                "\r\n"
                "var s = 'e���';\n"
                "var r = /e���/;\n";
    }
    else if (strcmp(url, "http://127.0.0.1:8000/malformed.js") == 0 || strcmp(url, "/malformed.js") == 0) {
      message = "HTTP/1.1 200 OK\r\n"
                "Connection: close\r\n"
                "Content-type: text/javascript; charset=UTF-8\r\n"
                "\r\n"
                "var s = 'e���';\n"
                "var r = /e���/;\n";
    }
    else {
      abort();
    }
    size_t message_length = strlen(message);
    ssize_t bytes_sent = send(client_socket, message, message_length, 0);
    assert(bytes_sent == (ssize_t) message_length);

    closesocket(client_socket);
  }
  return 0;
}
