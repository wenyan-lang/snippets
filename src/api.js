import axios from 'axios'

export const API_ROOT = 'https://wenyan-snippets.glitch.me'

export class API {
  static async getAll() {
    const res = await axios.get(`${API_ROOT}/all`)
    return res.data
  }

  static async getPage(page = 1) {
    const res = await axios.get(`${API_ROOT}/pages/${page}`)
    return res.data
  }

  static async search(str) {
    const res = await axios.post(`${API_ROOT}/search`, { keywords: str.split(' ') })
    return res.data
  }
  
  static async vote(id, v) {
    const res = await axios.get(`${API_ROOT}/snippets/${id}/vote/${v}`)
    return res.data
  }
}