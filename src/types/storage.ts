export interface Comment {
  id: string;
  authorName: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}
