import axios from 'axios'

export const API_ROOT = 'https://wenyan-snippets.glitch.me'

export class API {
  static async getAll() {
    const res = await axios.get(`${API_ROOT}/all`)
    return res.data
  }
  
  static async vote(id, increment) {
    const res = await axios.post(`${API_ROOT}/vote`, { id, increment })
    return res.data
  }
}