/**
 * @openapi
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a user
 *     description: Creates a new user. Authentication is not required for the current API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *           example:
 *             username: johndoe
 *             name: John Doe
 *             email: john@example.com
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 11111111-1111-1111-1111-111111111111
 *               username: johndoe
 *               name: John Doe
 *               email: john@example.com
 *               joinDate: '2026-07-06T10:00:00.000Z'
 *               role: USER
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '409':
 *         $ref: '#/components/responses/ConflictError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     tags:
 *       - Users
 *     summary: List users
 *     description: Returns a paginated list of users. Authentication is not required for the current API.
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Pagination offset.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of users to return.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Fuzzy search across username, name, and email.
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [joinDate, username, name, email]
 *           default: joinDate
 *         description: Sort order for the returned users.
 *       - in: query
 *         name: count
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include a total count in the response meta.
 *     responses:
 *       '200':
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *             example:
 *               data:
 *                 - id: 11111111-1111-1111-1111-111111111111
 *                   username: johndoe
 *                   name: John Doe
 *                   email: john@example.com
 *                   joinDate: '2026-07-06T10:00:00.000Z'
 *                   role: USER
 *               meta:
 *                 offset: 0
 *                 limit: 10
 *                 total: 1
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 * /users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     description: Returns a single user record by UUID. Authentication is not required for the current API.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID.
 *     responses:
 *       '200':
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 11111111-1111-1111-1111-111111111111
 *               username: johndoe
 *               name: John Doe
 *               email: john@example.com
 *               joinDate: '2026-07-06T10:00:00.000Z'
 *               role: USER
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update a user
 *     description: Updates one or more user fields by UUID. Authentication is not required for the current API.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *           example:
 *             name: John Smith
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 11111111-1111-1111-1111-111111111111
 *               username: johnsmith
 *               name: John Smith
 *               email: johnsmith@example.com
 *               joinDate: '2026-07-06T10:00:00.000Z'
 *               role: USER
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user
 *     description: Soft deletes a user by UUID. Authentication is not required for the current API.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID.
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *               required:
 *                 - message
 *             example:
 *               message: User deleted successfully
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
