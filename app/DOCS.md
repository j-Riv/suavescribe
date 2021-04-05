# Shopify App Extension

## Structure of a session token JWT

Header

```json:
{
  "alg": "HS256",  -- The algorithm used to encode the JWT
  "typ": "JWT",    -- https://tools.ietf.org/html/rfc7519#section-5.1
}
```

Payload:

```json
{
  "iss": "<shop-name.myshopify.com/admin>", -- The shop’s admin domain
  "dest": "<shop-name.myshopify.com>",      -- The shop’s domain
  "aud": "<api key>",         -- The Api key of the receiving app
  "sub": "<user id>",         -- The user the JWT is intended for
  "exp": "<time in seconds>",   -- when the JWT expires
  "nbf": "<time in seconds>",   -- when the JWT activates
  "iat": "<time in seconds>",   -- when the JWT was issued
  "jti": "<random UUID>",   -- A secure random UUID
}
```

Sample Payload: (All times are in UNIX timestamp format.)

```json
{
 "iss"=>"https://exampleshop.myshopify.com/admin",
 "dest"=>"https://exampleshop.myshopify.com",
 "aud"=>"api-key-123",
 "sub"=>42,
 "exp"=>1591765058,
 "nbf"=>1591764998,
 "iat"=>1591764998,
 "jti"=>"f8912129-1af6-4cad-9ca3-76b0f7621087"
}
```
