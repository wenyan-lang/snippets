import axios from 'axios'

export const API_ROOT = 'https://wenyan-snippets.glitch.me'

export class API {
  static async getAll() {
    const res = await axios.get(`${API_ROOT}/all`)
    return res.data
  }

  static async get(id) {
    const res = await axios.get(`${API_ROOT}/snippets/${id}`)
    return res.data
  }

  static async modify(id, snippet) {
    const res = await axios.put(`${API_ROOT}/snippets/${id}`, snippet)
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

  static async publish(data) {
    const res = await axios.post(`${API_ROOT}/snippets`, data)
    return res.data
  }
}