export interface RecentActivity {
  type: 'User' | 'Professional' | 'Post'; // tipo da ação
  description: string; // informação resumida (ex: email, nome, título)
  date: Date; // data da ação
}
