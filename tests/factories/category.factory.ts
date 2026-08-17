export function buildCreateCategoryDTO(overrides = {}) {
    return {
        name: 'Adventure',
        description: null,
        ...overrides,
    };
}

export function buildUpdateCategoryDTO(overrides = {}) {
    return {
        name: 'Updated Category',
        ...overrides,
    };
}

export function buildCategory(overrides = {}) {
    return {
        id: 'c-1',
        name: 'Adventure',
        description: null,
        createdAt: new Date('2024-01-01'),
        ...overrides,
    };
}

export function buildCategoryList(count = 2) {
    return Array.from({ length: count }, (_, i) =>
        buildCategory({ id: `c-${i + 1}`, name: `Category ${i + 1}` }),
    );
}
