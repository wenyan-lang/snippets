import axios from 'axios'

export const API_ROOT = 'https://wys.glitch.me'

export class API {
  static async get(id, token) {
    const res = await axios.get(`${API_ROOT}/snippets/${id}`, { params: { token }})
    return res.data
  }

  static async modify(id, snippet) {
    const res = await axios.put(`${API_ROOT}/snippets/${id}`, snippet)
    return res.data
  }

  static async getPage(page = 1, token) {
    const res = await axios.get(`${API_ROOT}/pages/${page}`, { params: { token }})
    return res.data
  }

  static async search(str, token) {
    const query = {
      keywords: [],
    }
    const sections = str.split(' ')
    for (const s of sections){
      if (s.includes(':')) {
        const [key, value] = s.split(':', 2)
        if (['author', 'tag'].includes(key))
          query[key] = value
        else if (key === 'is' && value === 'mine')
          query.token = token
      }
      else {
        query.keywords.push(s)
      }
    }

    const res = await axios.post(`${API_ROOT}/search`, { query, token })
    return res.data
  }
  
  static async vote(id, v, token) {
    const res = await axios.get(`${API_ROOT}/snippets/${id}/vote/${v}`, { params: { token }})
    return res.data
  }

  static async publish(data) {
    const res = await axios.post(`${API_ROOT}/snippets`, data)
    return res.data
  }
}