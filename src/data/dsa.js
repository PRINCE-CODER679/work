/**
 * Verified DSA implementations sourced directly from Asrar Mulla's
 * PRINCE-CODER679/raambad-ilaaj repository (C & Python practical implementations).
 * No invented LeetCode/platform numbers.
 */
export const DSA_MODULES = [
  {
    id: 'binary-search',
    index: '01',
    name: 'Binary Search',
    repoFile: 'exp1_linear_binary_search.c',
    complexity: 'O(log n) Time · O(1) Space',
    summary: 'Divide-and-conquer lookup over sorted customer/library IDs by halving the search window each step.',
    code: `int binarySearch(int arr[], int n, int key) {
  int low = 0, high = n - 1;
  while (low <= high) {
    int mid = low + (high - low) / 2;
    if (arr[mid] == key) return mid;
    if (arr[mid] < key) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    initialData: [12, 19, 27, 34, 41, 56, 68, 74, 83, 95],
    target: 68,
  },
  {
    id: 'stack',
    index: '02',
    name: 'Infix → Postfix Stack',
    repoFile: 'exp6_infix_postfix_stack.c',
    complexity: 'O(n) Time · O(n) Auxiliary Stack',
    summary: 'Operator-precedence expression parser converting algebraic notation into postfix evaluation order.',
    code: `while (!isEmpty() && precedence(peek()) >= precedence(ch)) {
  postfix[k++] = pop();
}
push(ch);`,
    expression: 'A+B*C-(D/E)',
  },
  {
    id: 'linked-list',
    index: '03',
    name: 'Singly Linked List',
    repoFile: 'exp4_club_singly_linked_list.c',
    complexity: 'O(1) Head Insert · O(n) Traversal',
    summary: 'Dynamic pointer-linked member roster supporting head/tail insertion, deletion, and reversal.',
    code: `struct Node* insertHead(struct Node* head, int id) {
  struct Node* node = malloc(sizeof(struct Node));
  node->id = id;
  node->next = head;
  return node;
}`,
    nodes: ['101 · PRES', '104 · TECH', '109 · DATA', '118 · SEC'],
  },
  {
    id: 'bst',
    index: '04',
    name: 'Binary Search Tree',
    repoFile: '10Binary Search Tree (BST) Operations.py',
    complexity: 'O(log n) Avg Insert/Search',
    summary: 'Recursive ordered binary tree supporting insertion, key search, and sorted inorder traversal.',
    code: `def insert(root, key):
    if root is None:
        return Node(key)
    if key < root.val:
        root.left = insert(root.left, key)
    elif key > root.val:
        root.right = insert(root.right, key)
    return root`,
    values: [50, 28, 74, 16, 39, 63, 88],
  },
  {
    id: 'graph-bfs',
    index: '05',
    name: 'Graph Traversal (BFS)',
    repoFile: '9City Location Graph Traversal (BFS & DFS).py',
    complexity: 'O(V + E) Time · Queue Frontier',
    summary: 'Level-by-level adjacency traversal over city transit nodes using a FIFO visited frontier.',
    code: `def bfs(graph, start):
    visited, q = {start}, deque([start])
    while q:
        u = q.popleft()
        for v in graph[u]:
            if v not in visited:
                visited.add(v); q.append(v)`,
    graph: {
      nodes: [
        { id: 'A', label: 'HUB', x: 50, y: 20 },
        { id: 'B', label: 'N-01', x: 20, y: 50 },
        { id: 'C', label: 'N-02', x: 80, y: 50 },
        { id: 'D', label: 'E-01', x: 14, y: 84 },
        { id: 'E', label: 'E-02', x: 50, y: 84 },
        { id: 'F', label: 'E-03', x: 86, y: 84 },
      ],
      edges: [
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'D'],
        ['B', 'E'],
        ['C', 'E'],
        ['C', 'F'],
      ],
    },
  },
];

