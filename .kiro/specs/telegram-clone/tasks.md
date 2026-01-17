# Implementation Plan

- [x] 1. Set up project structure and dependencies



  - Initialize Node.js/TypeScript project with proper tsconfig
  - Install core dependencies: Express, Socket.io, TypeORM, PostgreSQL driver, JWT, bcrypt
  - Install testing dependencies: Jest, fast-check
  - Set up project folder structure: src/services, src/models, src/routes, src/utils, tests/
  - Create environment configuration file structure
  - _Requirements: All_

- [ ] 2. Set up database schema and connection
  - Create PostgreSQL database connection configuration
  - Define TypeORM entities for User, Contact, Group, GroupMember, Message, MediaFile, MessageReceipt, VerificationSession
  - Create database migration files for all tables
  - Set up database connection pool and error handling
  - _Requirements: All_

- [ ] 3. Implement authentication service
  - [ ] 3.1 Create User entity and repository
    - Define User entity with all fields from design
    - Implement user repository with basic CRUD operations
    - _Requirements: 1.2, 10.1, 10.2_
  
  - [ ] 3.2 Implement phone number validation
    - Create phone number format validation function
    - _Requirements: 1.3_
  
  - [ ] 3.3 Write property test for phone validation
    - **Property 3: Invalid phone number rejection**
    - **Validates: Requirements 1.3**
  
  - [ ] 3.4 Implement verification session creation
    - Create VerificationSession entity and repository
    - Implement session creation with code generation
    - Add session expiration logic
    - _Requirements: 1.1_
  
  - [ ] 3.5 Write property test for verification session
    - **Property 1: Verification session creation**
    - **Validates: Requirements 1.1**
  
  - [ ] 3.6 Implement code verification and account creation
    - Create verification logic to check code against session
    - Implement user account creation on successful verification
    - Generate JWT tokens (access and refresh)
    - _Requirements: 1.2_
  
  - [ ] 3.7 Write property test for verification flow
    - **Property 2: Successful verification creates account**
    - **Validates: Requirements 1.2**
  
  - [ ] 3.8 Implement incorrect code handling
    - Add logic to reject incorrect codes while maintaining session
    - _Requirements: 1.4_
  
  - [ ] 3.9 Write property test for incorrect code rejection
    - **Property 4: Incorrect verification code rejection**
    - **Validates: Requirements 1.4**
  
  - [ ] 3.10 Create authentication middleware
    - Implement JWT token validation middleware
    - Add token refresh endpoint
    - _Requirements: 8.4_
  
  - [ ] 3.11 Write property test for authentication requirement
    - **Property 29: Authentication requirement**
    - **Validates: Requirements 8.4**

- [ ] 4. Implement user service
  - [ ] 4.1 Implement user profile operations
    - Create methods for updating display name, username, profile picture, bio
    - Add username uniqueness validation
    - _Requirements: 1.5_
  
  - [ ] 4.2 Implement user search functionality
    - Create search by phone number method
    - Create search by username method
    - _Requirements: 10.1, 10.2_
  
  - [ ] 4.3 Write property test for user search
    - **Property 35: User search by identifier**
    - **Validates: Requirements 10.1, 10.2**
  
  - [ ] 4.4 Implement contact management
    - Create Contact entity and repository
    - Implement add contact method with notification
    - Implement remove contact method
    - Implement get contacts list method
    - _Requirements: 10.5_
  
  - [ ]* 4.4 Write property test for contact addition
    - **Property 36: Contact addition**
    - **Validates: Requirements 10.5**
  
  - [ ] 4.6 Implement online status management
    - Add methods to update online status
    - Add method to get online status with privacy filtering
    - Implement last seen timestamp updates
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [ ] 4.7 Write property test for status updates
    - **Property 16: Connection sets online status**
    - **Property 17: Disconnection sets offline status**
    - **Property 18: Status retrieval**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ] 4.8 Write property test for privacy-filtered status
    - **Property 20: Privacy-filtered status**
    - **Validates: Requirements 5.5**

- [ ] 5. Implement message service
  - [ ] 5.1 Create Message entity and repository
    - Define Message entity with all fields
    - Create message repository with CRUD operations
    - Add indexes for performance (sender_id, recipient_id, group_id, created_at)
    - _Requirements: 2.1_
  
  - [ ] 5.2 Implement message validation
    - Create validation to reject empty or whitespace-only messages
    - _Requirements: 2.5_
  
  - [ ] 5.3 Write property test for empty message rejection
    - **Property 7: Empty message rejection**
    - **Validates: Requirements 2.5**
  
  - [ ] 5.4 Implement send message functionality
    - Create method to send direct messages
    - Store message with 'sent' status
    - _Requirements: 2.1, 2.2_
  
  - [ ] 5.5 Write property test for message delivery
    - **Property 5: Message delivery**
    - **Validates: Requirements 2.1**
  
  - [ ] 5.6 Implement message status updates
    - Create method to update message status to 'delivered'
    - Create MessageReceipt entity for read receipts
    - Implement mark as read functionality
    - _Requirements: 2.3, 2.4_
  
  - [ ] 5.7 Write property test for message status progression
    - **Property 6: Message status progression**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  
  - [ ] 5.8 Implement message editing
    - Create edit message method with sender validation
    - Set isEdited flag on edited messages
    - Add 48-hour time restriction check
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [ ] 5.9 Write property test for edit propagation
    - **Property 30: Edit propagation**
    - **Property 31: Edit indicator**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ] 5.10 Write property test for time-based edit restriction
    - **Property 34: Time-based edit restriction**
    - **Validates: Requirements 9.5**
  
  - [ ] 5.11 Implement message deletion
    - Create delete for everyone method (sets isDeleted flag)
    - Create delete for self method (user-specific deletion)
    - _Requirements: 9.3, 9.4, 8.3_
  
  - [ ] 5.12 Write property test for delete for everyone
    - **Property 32: Delete for everyone**
    - **Validates: Requirements 9.3**
  
  - [ ] 5.13 Write property test for delete for self
    - **Property 33: Delete for self**
    - **Validates: Requirements 9.4**
  
  - [ ] 5.14 Write property test for message deletion completeness
    - **Property 28: Message deletion completeness**
    - **Validates: Requirements 8.3**
  
  - [ ] 5.15 Implement message search
    - Create search method with text query
    - Add chat-specific search filtering
    - Implement pagination for search results
    - _Requirements: 6.1, 6.4_
  
  - [ ] 5.16 Write property test for message search
    - **Property 21: Message search completeness**
    - **Property 22: Chat-specific search filtering**
    - **Validates: Requirements 6.1, 6.4**
  
  - [ ] 5.17 Implement data encryption
    - Add encryption utility functions using AES-256
    - Encrypt message content before storing
    - Decrypt message content when retrieving
    - _Requirements: 8.2_
  
  - [ ] 5.18 Write property test for data encryption
    - **Property 27: Data at rest encryption**
    - **Validates: Requirements 8.2**

- [ ] 6. Implement group service
  - [ ] 6.1 Create Group and GroupMember entities
    - Define Group entity with all fields
    - Define GroupMember entity with user_id, group_id, is_admin
    - Create repositories for both entities
    - _Requirements: 4.1_
  
  - [ ] 6.2 Implement group creation
    - Create method to create group with name and initial members
    - Set creator as admin
    - Add all specified members to group
    - _Requirements: 4.1_
  
  - [ ] 6.3 Write property test for group creation
    - **Property 11: Group creation with members**
    - **Validates: Requirements 4.1**
  
  - [ ] 6.4 Implement add member functionality
    - Create method to add member to group
    - Generate notification for added user
    - _Requirements: 4.3_
  
  - [ ] 6.5 Write property test for membership notification
    - **Property 13: Group membership notification**
    - **Validates: Requirements 4.3**
  
  - [ ] 6.6 Implement remove member functionality
    - Create method for admin to remove member
    - Validate admin permissions
    - _Requirements: 4.4_
  
  - [ ] 6.7 Write property test for member removal
    - **Property 14: Member removal**
    - **Validates: Requirements 4.4**
  
  - [ ] 6.8 Implement leave group functionality
    - Create method for user to leave group
    - Remove user from member list
    - Notify remaining members
    - _Requirements: 4.5_
  
  - [ ] 6.9 Write property test for group leave
    - **Property 15: Group leave**
    - **Validates: Requirements 4.5**
  
  - [ ] 6.10 Implement group message sending
    - Create method to send message to all group members
    - Retrieve all current members and create message records
    - _Requirements: 4.2_
  
  - [ ] 6.11 Write property test for group message broadcasting
    - **Property 12: Group message broadcasting**
    - **Validates: Requirements 4.2**

- [ ] 7. Implement media service
  - [ ] 7.1 Create MediaFile entity and repository
    - Define MediaFile entity with all fields
    - Create repository with CRUD operations
    - _Requirements: 3.1, 3.2_
  
  - [ ] 7.2 Set up file storage
    - Configure local file storage or S3 connection
    - Create upload directory structure
    - Implement file size validation (images: 10MB, videos: 100MB, documents: 50MB)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 7.3 Implement media upload
    - Create upload method that stores file and creates MediaFile record
    - Generate unique filename to prevent collisions
    - Handle upload errors and cleanup on failure
    - Support document file types (PDF, DOC, DOCX, ZIP, TXT, etc.)
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [ ] 7.4 Write property test for media upload
    - **Property 8: Media upload and attachment**
    - **Property 41: Document upload and metadata**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ] 7.5 Write property test for upload error handling
    - **Property 9: Media upload error handling**
    - **Validates: Requirements 3.5**
  
  - [ ] 7.6 Implement thumbnail generation
    - Add thumbnail generation for images using sharp library
    - Add thumbnail generation for videos using ffmpeg
    - Store thumbnail path in MediaFile record
    - _Requirements: 3.5_
  
  - [ ] 7.7 Write property test for thumbnail generation
    - **Property 10: Thumbnail generation**
    - **Validates: Requirements 3.6**
  
  - [ ] 7.8 Implement document download
    - Create secure download endpoint for documents
    - Preserve original filename and content-type
    - Add download authentication and access control
    - _Requirements: 3.7_
  
  - [ ] 7.9 Write property test for document download
    - **Property 42: Document download capability**
    - **Validates: Requirements 3.7**
  
  - [ ] 7.10 Implement media retrieval
    - Create method to get media file by ID
    - Add authentication check for media access
    - _Requirements: 3.6_
  
  - [ ] 7.11 Integrate media with messages
    - Update message sending to support media attachments
    - Link MediaFile records to Message records
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Implement WebSocket manager for real-time features
  - [ ] 8.1 Set up Socket.io server
    - Initialize Socket.io with Express server
    - Configure CORS and authentication middleware
    - _Requirements: 2.1, 5.4_
  
  - [ ] 8.2 Implement connection management
    - Handle user connection events
    - Update online status on connect
    - Store socket ID mapping to user ID
    - _Requirements: 5.1_
  
  - [ ] 8.3 Implement disconnection handling
    - Handle user disconnection events
    - Update online status and last seen on disconnect
    - Clean up socket ID mappings
    - _Requirements: 5.2_
  
  - [ ] 8.4 Implement message broadcasting
    - Create method to send message to specific user(s)
    - Implement group message broadcasting to all members
    - _Requirements: 2.1, 4.2_
  
  - [ ] 8.5 Implement status update broadcasting
    - Broadcast online status changes to user's contacts
    - _Requirements: 5.4_
  
  - [ ] 8.6 Write property test for status broadcasting
    - **Property 19: Status change broadcasting**
    - **Validates: Requirements 5.4**

- [ ] 9. Implement notification system
  - [ ] 9.1 Create Notification model and service
    - Create Notification entity with all fields
    - Create NotificationService with CRUD operations
    - Implement notification creation logic
    - _Requirements: 7.1_
  
  - [ ] 9.2 Create notification generation logic
    - Create method to generate notification for new messages
    - Check if user is actively viewing the chat
    - Check if chat is muted
    - Check user notification settings
    - _Requirements: 7.1, 7.3, 7.4, 11.3_
  
  - [ ] 9.3 Write property test for new message notification
    - **Property 23: New message notification**
    - **Property 43: Notification delivery**
    - **Validates: Requirements 7.1**
  
  - [ ] 9.4 Write property test for active chat suppression
    - **Property 24: Active chat notification suppression**
    - **Validates: Requirements 7.3**
  
  - [ ] 9.5 Write property test for muted chat suppression
    - **Property 25: Muted chat notification suppression**
    - **Validates: Requirements 7.4**
  
  - [ ] 9.6 Implement notification grouping
    - Group multiple notifications from same chat
    - _Requirements: 7.5_
  
  - [ ] 9.7 Write property test for notification grouping
    - **Property 26: Notification grouping**
    - **Validates: Requirements 7.5**
  
  - [ ] 9.8 Integrate notifications with WebSocket
    - Send notifications through WebSocket to connected users
    - Send unread count updates in real-time
    - _Requirements: 7.1_
  
  - [ ] 9.9 Write property test for unread count
    - **Property 44: Unread count accuracy**
    - **Validates: Requirements 7.1**
  
  - [ ] 9.10 Write property test for notification settings
    - **Property 45: Notification settings enforcement**
    - **Validates: Requirements 11.3**

- [ ] 10. Create REST API endpoints
  - [ ] 10.1 Create authentication routes
    - POST /auth/register - initiate registration with phone number
    - POST /auth/verify - verify code and create account
    - POST /auth/login - login with phone and password
    - POST /auth/refresh - refresh access token
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 10.2 Create user routes
    - GET /users/me - get current user profile
    - PUT /users/me - update user profile
    - GET /users/search - search users by phone or username
    - GET /users/:id - get user by ID
    - GET /users/:id/status - get user online status
    - _Requirements: 1.5, 5.3, 10.1, 10.2_
  
  - [ ] 10.3 Create contact routes
    - POST /contacts - add contact
    - DELETE /contacts/:id - remove contact
    - GET /contacts - get contact list
    - _Requirements: 10.5_
  
  - [ ] 10.4 Create message routes
    - POST /messages - send message
    - GET /messages - get messages (with pagination)
    - PUT /messages/:id - edit message
    - DELETE /messages/:id - delete message
    - POST /messages/:id/read - mark message as read
    - GET /messages/search - search messages
    - _Requirements: 2.1, 2.4, 6.1, 6.4, 9.1, 9.3, 9.4_
  
  - [ ] 10.5 Create group routes
    - POST /groups - create group
    - GET /groups/:id - get group details
    - PUT /groups/:id - update group
    - POST /groups/:id/members - add member
    - DELETE /groups/:id/members/:userId - remove member
    - POST /groups/:id/leave - leave group
    - GET /groups/:id/members - get group members
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  
  - [ ] 10.6 Create media routes
    - POST /media/upload - upload media file
    - GET /media/:id - get media file
    - GET /media/:id/thumbnail - get media thumbnail
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 10.7 Create settings routes
    - GET /settings - get user settings
    - PUT /settings - update user settings
    - GET /settings/privacy - get privacy settings
    - PUT /settings/privacy - update privacy settings
    - GET /settings/notifications - get notification settings
    - PUT /settings/notifications - update notification settings
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [ ] 10.8 Create notification routes
    - GET /notifications - get user notifications
    - PUT /notifications/:id/read - mark notification as read
    - PUT /notifications/read-all - mark all notifications as read
    - DELETE /notifications/:id - delete notification
    - GET /notifications/unread-count - get unread count
    - _Requirements: 7.1, 7.2_

- [ ] 11. Implement Settings Service
  - [ ] 11.1 Create settings models
    - Create UserSettings, PrivacySettings, NotificationSettings models
    - Set up database migrations for settings tables
    - _Requirements: 11.1, 11.5_
  
  - [ ] 11.2 Implement settings service methods
    - Add getUserSettings method
    - Add updateUserSettings method
    - Add privacy and notification specific methods
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ] 11.3 Write property test for settings persistence
    - **Property 37: Settings persistence**
    - **Validates: Requirements 11.5**
  
  - [ ] 11.4 Write property test for privacy enforcement
    - **Property 38: Privacy setting enforcement**
    - **Validates: Requirements 11.2**
  
  - [ ] 11.5 Write property test for notification settings
    - **Property 39: Notification setting application**
    - **Validates: Requirements 11.3**
  
  - [ ] 11.6 Write property test for theme application
    - **Property 40: Theme application**
    - **Validates: Requirements 11.4**

- [ ] 12. Implement Settings Frontend
  - [ ] 12.1 Create settings page component
    - Create SettingsPage component with navigation tabs
    - Implement privacy settings section
    - Implement notification settings section
    - Implement theme settings section
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 12.2 Create settings API client
    - Add settings API methods to frontend
    - Implement GET /settings, PUT /settings endpoints
    - Add privacy and notification specific API calls
    - _Requirements: 11.1, 11.5_
  
  - [ ] 12.3 Implement theme switching
    - Create theme context provider
    - Implement light/dark/auto theme switching
    - Apply theme changes across all components
    - _Requirements: 11.4_
  
  - [ ] 12.4 Implement privacy controls
    - Create privacy settings form components
    - Add online status visibility controls
    - Add profile photo visibility controls
    - _Requirements: 11.2_
  
  - [ ] 12.5 Implement notification controls
    - Create notification settings form components
    - Add toggle switches for different notification types
    - Add sound and vibration controls
    - _Requirements: 11.3_

- [ ] 13. Implement Group Chat Frontend
  - [ ] 13.1 Create group creation UI
    - Create "Yangi Guruh" (New Group) button in chat list
    - Implement group creation modal/page
    - Add group name input and description field
    - Add member selection from contacts list
    - _Requirements: 4.1_
  
  - [ ] 13.2 Create group API client
    - Add group API methods to frontend
    - Implement POST /groups, GET /groups/:id endpoints
    - Add member management API calls
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  
  - [ ] 13.3 Implement group chat UI
    - Extend ChatPage to support group conversations
    - Show group name and member count in header
    - Display group member list in sidebar/modal
    - Add group-specific message indicators
    - _Requirements: 4.2_
  
  - [ ] 13.4 Implement group member management
    - Create group info/settings page
    - Add member list with admin controls
    - Implement add/remove member functionality
    - Add leave group option
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ] 13.5 Implement group message broadcasting
    - Update socket integration for group messages
    - Handle group message delivery in real-time
    - Show delivery status for group messages
    - _Requirements: 4.2_

- [ ] 14. Implement Document Sharing Frontend
  - [ ] 14.1 Create document file picker
    - Add document upload button in chat input (📎 icon)
    - Implement file picker for documents (PDF, DOC, ZIP, etc.)
    - Add file type validation and size limits
    - _Requirements: 3.3_
  
  - [ ] 14.2 Create document preview UI
    - Show document name, size, and type before sending
    - Add document icon based on file type
    - Implement upload progress indicator
    - Add cancel upload option
    - _Requirements: 3.4, 3.5_
  
  - [ ] 14.3 Implement document message display
    - Create document message bubble component
    - Show file icon, name, size, and download button
    - Add different icons for PDF, DOC, ZIP, etc.
    - Display "📄 Hujjat" in chat list for document messages
    - _Requirements: 3.7_
  
  - [ ] 14.4 Implement document download
    - Add download functionality for received documents
    - Preserve original filename when downloading
    - Show download progress indicator
    - Handle download errors gracefully
    - _Requirements: 3.7_
  
  - [ ] 14.5 Update media API for documents
    - Extend existing mediaApi to support documents
    - Add document-specific upload methods
    - Update socket integration for document messages
    - _Requirements: 3.3, 3.7_

- [ ] 15. Implement Notification Frontend
  - [ ] 15.1 Create notification API client
    - Add notification API methods to frontend
    - Implement GET /notifications, PUT /notifications/:id/read endpoints
    - Add unread count API integration
    - _Requirements: 7.1, 7.2_
  
  - [ ] 15.2 Implement browser notifications
    - Request notification permission from user
    - Show browser notifications for new messages
    - Handle notification click to open relevant chat
    - _Requirements: 7.1, 7.2_
  
  - [ ] 15.3 Implement real-time notification updates
    - Update socket integration for notifications
    - Handle notification delivery via WebSocket
    - Update unread counts in real-time
    - _Requirements: 7.1_
  
  - [ ] 15.4 Create notification center UI
    - Add notification bell icon in header
    - Show unread notification count badge
    - Create notification dropdown/panel
    - Display notification list with read/unread states
    - _Requirements: 7.1, 7.2_
  
  - [ ] 15.5 Implement notification management
    - Add mark as read functionality
    - Add mark all as read option
    - Add delete notification option
    - Integrate with notification settings
    - _Requirements: 7.1, 7.2, 11.3_

- [ ] 16. Add error handling and validation
  - [ ] 16.1 Create error handling middleware
    - Implement global error handler
    - Create custom error classes for different error types
    - Format error responses consistently
    - _Requirements: All_
  
  - [ ] 16.2 Add request validation
    - Implement validation middleware using express-validator
    - Add validation for all API endpoints
    - _Requirements: All_
  
  - [ ] 11.3 Implement rate limiting
    - Add rate limiting middleware for authentication endpoints
    - Add rate limiting for message sending
    - _Requirements: All_

- [ ] 12. Set up testing infrastructure
  - [ ] 12.1 Configure Jest for unit and property tests
    - Set up Jest configuration for TypeScript
    - Configure test database connection
    - Create test utilities and helpers
    - _Requirements: All_
  
  - [ ] 12.2 Create test data factories
    - Create factory functions for User, Message, Group entities
    - Implement random data generators for property tests
    - _Requirements: All_
  
  - [ ] 12.3 Set up fast-check for property-based testing
    - Configure fast-check with 100 iterations minimum
    - Create custom arbitraries for domain objects
    - _Requirements: All_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create database migrations and seed data
  - [ ] 14.1 Create migration scripts
    - Write migration to create all tables
    - Write migration to add indexes
    - _Requirements: All_
  
  - [ ] 14.2 Create seed data script
    - Create script to generate sample users
    - Create script to generate sample messages and groups
    - _Requirements: All_

- [ ] 15. Add logging and monitoring
  - [ ] 15.1 Set up logging
    - Configure Winston or Pino for application logging
    - Add request logging middleware
    - Log all errors with stack traces
    - _Requirements: 8.5_
  
  - [ ] 15.2 Add performance monitoring
    - Add response time tracking
    - Monitor database query performance
    - Track WebSocket connection counts
    - _Requirements: All_

- [ ] 16. Create application entry point and configuration
  - [ ] 16.1 Create main server file
    - Initialize Express app
    - Set up middleware (CORS, body parser, etc.)
    - Mount all routes
    - Initialize Socket.io
    - Start server
    - _Requirements: All_
  
  - [ ] 16.2 Create environment configuration
    - Set up dotenv for environment variables
    - Create configuration for database, JWT, file storage
    - Add configuration validation
    - _Requirements: All_
  
  - [ ] 16.3 Create README with setup instructions
    - Document installation steps
    - Document environment variables
    - Document API endpoints
    - Add development and testing instructions
    - _Requirements: All_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
