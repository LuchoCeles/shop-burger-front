const API_URL = process.env.REACT_APP_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async POST(url, data, isFormData = false) {
    const config = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: isFormData ? data : JSON.stringify(data)
    };

    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    return await fetch(this.baseURL + url, config);
  }

  async GET(url, data) {
    const queryString = data ? `?${new URLSearchParams(data).toString()}` : "";

    return await fetch(this.baseURL + url + queryString, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  };

  async PATCH(url, data, isFormData = false) {
    const config = {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: isFormData ? data : JSON.stringify(data)
    };

    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    return await fetch(this.baseURL + url, config);
  }

  async DELETE(url, data) {
    const objString = '?' + new URLSearchParams(data).toString();

    return await fetch(this.baseURL + url + objString, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
  }


  // Auth endpoints
  async login(nombre, password) {
    return this.POST('admin/login', { nombre, password });
  }

  // Products endpoints
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.GET('api/productos', params);
  }

  async getProduct(id) {
    return this.GET(`api/producto/${id}`);
  }

  async createProduct(productData) {
    return this.POST('api/producto', productData, true);
  }

  async updateProduct(id, productData) {
    return this.PATCH(`api/${id}`, productData, true);
  }

  async deleteProduct(id) {
    return this.DELETE(`api/producto/${id}`);
  }

  // Categories endpoints
  async getCategories() {
    return this.GET('api/categorias');
  }

  async createCategory(nombre) {
    return this.POST('api/categorias', { nombre });
  }

  async updateCategory(id, nombre) {
    return this.PATCH(`api/categorias/${id}`, { nombre });
  }

  async deleteCategory(id) {
    return this.DELETE(`api/categorias/${id}`);
  }

  // Orders endpoints
  async getOrders() {
    return this.GET('api/ordenes');
  }

  async updateOrder(orderData) {
    return this.PATCH(`api/ordenes/${orderData.id}`, orderData);
  }

  async deleteOrder(id) {
    return this.DELETE(`api/ordenes/${id}`);
  }

}

export default new ApiService();