export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  createdAt: string;
  tags: string[];
}

export interface Portfolio {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  link: string;
  technologies: string[];
}
