# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long urls into easy to use short urls.

## Final Product

The finalized project includes the capability to shorten any url. There are also update capabilities, in which you can update the original url, using the same shortened url. Only the user who created the urls can see the display of the long and shortened url, however, anyone, regardless of if they're logged in, can use the shortened url.
Both passwords and cookies are stored securely.

!["Screenshot of URLs page - displaying list of shortened urls"](https://github.com/ChantalDesrochers/tinyApp/blob/master/docs/Shortened_urls_list.png?raw=true)

!["Screenshot of edit URLs page - displaying specific urls"](https://github.com/ChantalDesrochers/tinyApp/blob/master/docs/Edit_long_url_page.png?raw=true)

!["Screenshot of login page"](https://github.com/ChantalDesrochers/tinyApp/blob/master/docs/login_page.png?raw=true)

## Dependencies
- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started
- Install all dependencies (using the 'npm install' command)
- Run the development web server using the 'node express_server.js' command.