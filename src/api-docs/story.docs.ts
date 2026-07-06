/**
 * @openapi
 * /stories:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Create a story
 *     description: Creates a new story record linked to a user. Authentication is not required for the current API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoryCreateRequest'
 *           example:
 *             userId: 11111111-1111-1111-1111-111111111111
 *             title: A Story About Testing
 *             body: This is a long story body used as an API example. It is intentionally verbose so it satisfies the validation minimum and looks like real content.
 *     responses:
 *       '201':
 *         description: Story created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 *             example:
 *               userId: 11111111-1111-1111-1111-111111111111
 *               storyId: 22222222-2222-2222-2222-222222222222
 *               title: A Story About Testing
 *               body: This is a long story body used as an API example. It is intentionally verbose so it resembles a real record in the API response.
 *               createdAt: '2026-07-06T10:00:00.000Z'
 *               updatedAt: '2026-07-06T10:30:00.000Z'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     tags:
 *       - Stories
 *     summary: List stories
 *     description: Returns a paginated list of stories. Authentication is not required for the current API.
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
 *         description: Maximum number of stories to return.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Fuzzy search across title and body.
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *         description: Sort order for the returned stories.
 *       - in: query
 *         name: count
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include a total count in the response meta.
 *     responses:
 *       '200':
 *         description: Stories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryListResponse'
 *             example:
 *               data:
 *                 - userId: 11111111-1111-1111-1111-111111111111
 *                   storyId: 22222222-2222-2222-2222-222222222222
 *                   title: A Story About Testing
 *                   body: This is a long story body used as an API example. It is intentionally verbose so it resembles a real record in the API response.
 *                   createdAt: '2026-07-06T10:00:00.000Z'
 *                   updatedAt: '2026-07-06T10:30:00.000Z'
 *               meta:
 *                 offset: 0
 *                 limit: 10
 *                 total: 1
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 * /stories/{storyId}:
 *   get:
 *     tags:
 *       - Stories
 *     summary: Get a story by ID
 *     description: Returns a single story record by UUID. Authentication is not required for the current API.
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Story UUID.
 *     responses:
 *       '200':
 *         description: Story retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 *             example:
 *               userId: 11111111-1111-1111-1111-111111111111
 *               storyId: 22222222-2222-2222-2222-222222222222
 *               title: A Story About Testing
 *               body: This is a long story body used as an API example. It is intentionally verbose so it resembles a real record in the API response.
 *               createdAt: '2026-07-06T10:00:00.000Z'
 *               updatedAt: '2026-07-06T10:30:00.000Z'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   patch:
 *     tags:
 *       - Stories
 *     summary: Update a story
 *     description: Updates one or more story fields by UUID. Authentication is not required for the current API.
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Story UUID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoryUpdateRequest'
 *           example:
 *             title: Updated Story Title
 *     responses:
 *       '200':
 *         description: Story updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 *             example:
 *               userId: 11111111-1111-1111-1111-111111111111
 *               storyId: 22222222-2222-2222-2222-222222222222
 *               title: Updated Story Title
 *               body: Updated body content that remains long enough to satisfy validation rules and demonstrate the payload shape.
 *               createdAt: '2026-07-06T10:00:00.000Z'
 *               updatedAt: '2026-07-06T10:30:00.000Z'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     tags:
 *       - Stories
 *     summary: Delete a story
 *     description: Permanently deletes a story by UUID. Authentication is not required for the current API.
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Story UUID.
 *     responses:
 *       '200':
 *         description: Story deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Story deleted successfully
 *               required:
 *                 - message
 *             example:
 *               message: Story deleted successfully
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
