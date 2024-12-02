export interface Account {
    id: string
    name: string
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  }
  
  export interface AccountEntry {
    account: Account
    amount: number
  }
  
  
  export interface JournalEntry {
    id: string
    date: string
    description: string
    debits: AccountEntry[]
    credits: AccountEntry[]
  }