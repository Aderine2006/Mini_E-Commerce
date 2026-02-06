const port = process.env.PORT || 4000;

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Mini E-Commerce API",
    version: "1.0.0"
  },
  servers: [{ url: `http://localhost:${port}` }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"]
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              email: { type: "string" },
              role: { type: "string", enum: ["user", "admin"] }
            },
            required: ["id", "email", "role"]
          }
        },
        required: ["token", "user"]
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          price: { type: "number" },
          category: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          createdBy: { type: "integer" },
          createdAt: { type: "string" }
        },
        required: ["id", "name", "price", "category", "keywords", "createdBy", "createdAt"]
      },
      CartItem: {
        type: "object",
        properties: {
          product: { $ref: "#/components/schemas/Product" },
          quantity: { type: "integer" }
        },
        required: ["product", "quantity"]
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } }
          }
        }
      }
    },
    "/auth/register": {
      post: {
        summary: "Register user/admin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["user", "admin"] }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          400: { description: "Bad Request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Conflict", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login (user/admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/products": {
      get: {
        summary: "List products",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { products: { type: "array", items: { $ref: "#/components/schemas/Product" } } },
                  required: ["products"]
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create product (admin only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  category: { type: "string" },
                  keywords: {
                    oneOf: [
                      { type: "string" },
                      { type: "array", items: { type: "string" } }
                    ]
                  }
                },
                required: ["name", "price", "category", "keywords"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { product: { $ref: "#/components/schemas/Product" } },
                  required: ["product"]
                }
              }
            }
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/products/{id}": {
      get: {
        summary: "Get product by id (tracks view if token provided)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { product: { $ref: "#/components/schemas/Product" } },
                  required: ["product"]
                }
              }
            }
          },
          404: { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      put: {
        summary: "Update product (admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  category: { type: "string" },
                  keywords: {
                    oneOf: [
                      { type: "string" },
                      { type: "array", items: { type: "string" } }
                    ]
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { product: { $ref: "#/components/schemas/Product" } },
                  required: ["product"]
                }
              }
            }
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      delete: {
        summary: "Delete product (admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/cart": {
      get: {
        summary: "Get current user's cart",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } } },
                  required: ["items"]
                }
              }
            }
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      post: {
        summary: "Add to cart (tracks cart_add activity)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productId: { type: "integer" },
                  quantity: { type: "integer" }
                },
                required: ["productId"]
              }
            }
          }
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/recommendations": {
      get: {
        summary: "Get AI recommendations (Gemini with fallback)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "userId", in: "query", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { products: { type: "array", items: { $ref: "#/components/schemas/Product" } } },
                  required: ["products"]
                }
              }
            }
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    }
  }
};

module.exports = { swaggerSpec };
