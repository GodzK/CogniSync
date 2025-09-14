# CogniSync API Testing Guide

This document provides instructions for testing all API endpoints in the CogniSync application using Postman. The API is built with Node.js, Express, and Supabase, and includes routes for authentication, user management, tasks, feedback, calendar events, and AI functionalities.

## Prerequisites
- **Postman**: Install Postman from [postman.com](https://www.postman.com/downloads/).
- **Server Running**: Start the server:
  ```bash
  node ./server.js
  ```
  The server runs on `http://localhost:3000` or `http://localhost:5000` (check `PORT` in your `.env` file).
- **Environment Variables**: Ensure your `.env` file contains:
  ```
  SUPABASE_URL=https://efybefdhtwpwyfgizkvh.supabase.co
  SUPABASE_KEY=your-supabase-key
  JWT_SECRET=your-jwt-secret
  PORT=3000  # or 5000
  ```
- **Supabase Database**: Verify the database has the following tables and enums:
  - **Enums**:
    - `user_role`: `employee`, `manager`
    - `task_category`: `routine`, `task`, `reminder`
    - `task_status`: `pending`, `in_progress`, `completed`
    - `calendar_source`: `internal`, `google`, `outlook`
  - **Tables**: `users`, `tasks`, `feedback_logs`, `calendar_events` (as defined in your schema).

## Postman Setup
1. **Create an Environment**:
   - In Postman, create an environment named "CogniSync".
   - Add variables:
     - `baseUrl`: `http://localhost:3000` (or `http://localhost:5000` if using port 5000)
     - `token`: Leave empty (will be set after login/register)
     - `user_id`: Leave empty (will be set after login/register)
     - `task_id`: Leave empty (will be set after creating a task)
     - `feedback_id`: Leave empty (will be set after creating feedback)
     - `event_id`: Leave empty (will be set after syncing a calendar event)

2. **Create a Collection**:
   - Create a Postman collection named "CogniSync API".
   - Organize requests into folders: `Auth`, `Users`, `Tasks`, `Feedback`, `Calendar`, `AI`.

3. **Authentication**:
   - Most endpoints require a JWT token in the `Authorization` header as `Bearer {{token}}`.
   - Obtain the token by testing the `POST /api/auth/register` or `POST /api/auth/login` endpoint first.

## Testing Endpoints

### Auth Routes (`/api/auth`)

#### 1. POST /api/auth/register
- **Description**: Register a new user.
- **URL**: `{{baseUrl}}/api/auth/register`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw, JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "employee"
  }
  ```
  **Note**: `role` must be `employee` or `manager` (per `user_role` enum).
- **Expected Response**:
  - **201 Success**:
    ```json
    {
      "user_id": "uuid",
      "token": "jwt-token"
    }
    ```
  - **400 Error**: If email exists or `role` is invalid (e.g., `"user"`).
- **Postman Tests**:
  ```javascript
  const response = pm.response.json();
  if (response.token) {
    pm.environment.set("token", response.token);
    pm.environment.set("user_id", response.user_id);
  }
  ```

#### 2. POST /api/auth/login
- **Description**: Log in an existing user.
- **URL**: `{{baseUrl}}/api/auth/login`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
- **Body** (raw, JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "user_id": "uuid",
      "token": "jwt-token"
    }
    ```
  - **400 Error**: If credentials are invalid.
- **Postman Tests**:
  ```javascript
  const response = pm.response.json();
  if (response.token) {
    pm.environment.set("token", response.token);
    pm.environment.set("user_id", response.user_id);
  }
  ```

#### 3. POST /api/auth/logout
- **Description**: Log out the user (returns success).
- **URL**: `{{baseUrl}}/api/auth/logout`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
- **Body**: None
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "success": true
    }
    ```

#### 4. GET /api/auth/me
- **Description**: Get the authenticated user’s profile.
- **URL**: `{{baseUrl}}/api/auth/me`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "user": {
        "id": "uuid",
        "email": "test@example.com",
        "name": "Test User",
        "role": "employee",
        ...
      }
    }
    ```
  - **401 Error**: If token is invalid or missing.

### User Routes (`/api/users`)

#### 1. GET /api/users/:user_id
- **Description**: Get user profile by ID.
- **URL**: `{{baseUrl}}/api/users/{{user_id}}`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "user_profile": {
        "id": "uuid",
        "email": "test@example.com",
        ...
      }
    }
    ```
  - **400 Error**: If user ID is invalid.

#### 2. PATCH /api/users/:user_id
- **Description**: Update user profile.
- **URL**: `{{baseUrl}}/api/users/{{user_id}}`
- **Method**: PATCH
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "name": "Updated Name",
    "role": "manager"
  }
  ```
  **Note**: `role` must be `employee` or `manager`.
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "user_profile": {
        "id": "uuid",
        "name": "Updated Name",
        ...
      }
    }
    ```

#### 3. GET /api/users/:user_id/analytics
- **Description**: Get user analytics (cognitive trend, sensory events).
- **URL**: `{{baseUrl}}/api/users/{{user_id}}/analytics`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "cognitive_trend": [7, 8, ...],
      "sensory_events": [{"noise": "loud"}, ...]
    }
    ```

### Task Routes (`/api/tasks`)

#### 1. POST /api/tasks
- **Description**: Create a new task.
- **URL**: `{{baseUrl}}/api/tasks`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "title": "Test Task",
    "description": "This is a test task",
    "category": "task",
    "priority": 3,
    "due_date": "2025-09-15T10:00:00Z",
    "status": "pending",
    "cognitive_load_estimate": 5
  }
  ```
  **Note**: 
  - `category` must be `routine`, `task`, or `reminder`.
  - `status` must be `pending`, `in_progress`, or `completed`.
  - `priority` must be 1–5.
  - `cognitive_load_estimate` must be 1–10.
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "task": {
        "id": "uuid",
        "user_id": "{{user_id}}",
        "title": "Test Task",
        ...
      }
    }
    ```
- **Postman Tests**:
  ```javascript
  const response = pm.response.json();
  if (response.task && response.task.id) {
    pm.environment.set("task_id", response.task.id);
  }
  ```

#### 2. GET /api/tasks
- **Description**: Get tasks (filter by user_id, status, etc.).
- **URL**: `{{baseUrl}}/api/tasks?user_id={{user_id}}&status=pending`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    [
      {
        "id": "uuid",
        "title": "Test Task",
        ...
      }
    ]
    ```

#### 3. GET /api/tasks/:task_id
- **Description**: Get a specific task by ID.
- **URL**: `{{baseUrl}}/api/tasks/{{task_id}}`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "task": {
        "id": "uuid",
        "title": "Test Task",
        ...
      }
    }
    ```

#### 4. PATCH /api/tasks/:task_id
- **Description**: Update a task.
- **URL**: `{{baseUrl}}/api/tasks/{{task_id}}`
- **Method**: PATCH
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "status": "in_progress",
    "priority": 4
  }
  ```
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "task": {
        "id": "uuid",
        "status": "in_progress",
        ...
      }
    }
    ```

#### 5. DELETE /api/tasks/:task_id
- **Description**: Delete a task.
- **URL**: `{{baseUrl}}/api/tasks/{{task_id}}`
- **Method**: DELETE
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "success": true
    }
    ```

#### 6. POST /api/tasks/:task_id/estimate_load
- **Description**: Estimate cognitive load for a task.
- **URL**: `{{baseUrl}}/api/tasks/{{task_id}}/estimate_load`
- **Method**: POST
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "cognitive_load_estimate": 5
    }
    ```

### Feedback Routes (`/api/feedback`)

#### 1. POST /api/feedback
- **Description**: Create a feedback log.
- **URL**: `{{baseUrl}}/api/feedback`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "task_id": "{{task_id}}",
    "mood_score": 7,
    "notes": "Feeling good",
    "sensory_overload_event": {"noise": "loud"}
  }
  ```
  **Note**: `mood_score` must be 1–10. `task_id` is optional.
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "feedback_log": {
        "id": "uuid",
        "user_id": "{{user_id}}",
        ...
      }
    }
    ```
- **Postman Tests**:
  ```javascript
  const response = pm.response.json();
  if (response.feedback_log && response.feedback_log.id) {
    pm.environment.set("feedback_id", response.feedback_log.id);
  }
  ```

#### 2. GET /api/feedback
- **Description**: Get feedback logs (filter by user_id).
- **URL**: `{{baseUrl}}/api/feedback?user_id={{user_id}}`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    [
      {
        "id": "uuid",
        "mood_score": 7,
        ...
      }
    ]
    ```

#### 3. GET /api/feedback/:id
- **Description**: Get a specific feedback log by ID.
- **URL**: `{{baseUrl}}/api/feedback/{{feedback_id}}`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "feedback_log": {
        "id": "uuid",
        "mood_score": 7,
        ...
      }
    }
    ```

### Calendar Routes (`/api/calendar`)

#### 1. POST /api/calendar/sync
- **Description**: Sync calendar events.
- **URL**: `{{baseUrl}}/api/calendar/sync`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "source": "google",
    "events": [
      {
        "title": "Meeting",
        "start_time": "2025-09-14T10:00:00Z",
        "end_time": "2025-09-14T11:00:00Z"
      }
    ]
  }
  ```
  **Note**: `source` must be `internal`, `google`, or `outlook`.
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "synced": true
    }
    ```

#### 2. GET /api/calendar/:user_id
- **Description**: Get calendar events for a user.
- **URL**: `{{baseUrl}}/api/calendar/{{user_id}}`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    [
      {
        "id": "uuid",
        "title": "Meeting",
        ...
      }
    ]
    ```
- **Postman Tests**:
  ```javascript
  const response = pm.response.json();
  if (response[0] && response[0].id) {
    pm.environment.set("event_id", response[0].id);
  }
  ```

#### 3. DELETE /api/calendar/:event_id
- **Description**: Delete a calendar event.
- **URL**: `{{baseUrl}}/api/calendar/{{event_id}}`
- **Method**: DELETE
- **Headers**:
  - `Authorization: Bearer {{token}}`
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "success": true
    }
    ```

### AI Routes (`/api/ai`)

#### 1. POST /api/ai/suggest_task_order
- **Description**: Suggest task order based on cognitive loads.
- **URL**: `{{baseUrl}}/api/ai/suggest_task_order`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "tasks": ["task1", "task2", "task3"],
    "cognitive_loads": [3, 1, 2]
  }
  ```
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "ordered_tasks": ["task2", "task3", "task1"]
    }
    ```

#### 2. POST /api/ai/sensory_alert
- **Description**: Generate sensory alert based on sensitivity.
- **URL**: `{{baseUrl}}/api/ai/sensory_alert`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- **Body** (raw, JSON):
  ```json
  {
    "sensory_sensitivity": {
      "noise": 5,
      "light": 3
    },
    "environment_data": {}
  }
  ```
- **Expected Response**:
  - **200 Success**:
    ```json
    {
      "alert_level": 5
    }
    ```

## Testing Workflow
1. **Start with Auth**:
   - Run `POST /api/auth/register` or `POST /api/auth/login` to get a `token` and `user_id`.
   - Save these in the Postman environment.

2. **Test Sequentially**:
   - Use `user_id` for `Users`, `Tasks`, `Feedback`, and `Calendar` endpoints.
   - Save `task_id`, `feedback_id`, and `event_id` from POST responses for use in GET/PATCH/DELETE requests.

3. **Validate Enum Values**:
   - `user_role`: `employee`, `manager`
   - `task_category`: `routine`, `task`, `reminder`
   - `task_status`: `pending`, `in_progress`, `completed`
   - `calendar_source`: `internal`, `google`, `outlook`

## Debugging Tips
- **401 Unauthorized**: Ensure `Authorization: Bearer {{token}}` is set. Refresh the token if expired.
- **400 Bad Request**:
  - Check for invalid enum values (e.g., `role` must be `employee` or `manager`).
  - Verify required fields in the request body.
- **500 Server Error**:
  - Check server logs (`node ./server.js`) for details.
  - Ensure Supabase tables match the schema.
  - Verify `JWT_SECRET` in `.env`.
- **Port Mismatch**:
  - Confirm the server port (`3000` or `5000`) matches Postman’s `baseUrl`.
- **Database Issues**:
  - Run this SQL query to verify table structure:
    ```sql
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
    ```
  - Check enum values:
    ```sql
    SELECT enum_range(NULL::user_role);
    ```

## Example Postman Collection
Export this JSON to Postman for a pre-configured collection:

```json
{
  "info": {
    "name": "CogniSync API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"test@example.com\", \"password\": \"password123\", \"name\": \"Test User\", \"role\": \"employee\"}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        }
        // Add other auth routes here
      ]
    }
    // Add folders for Users, Tasks, Feedback, Calendar, AI
  ]
}
```