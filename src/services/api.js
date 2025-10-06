const API_URL = import.meta.env.VITE_API_URL;

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
    const rsp = await this.POST('admin/login', { nombre, password });
    return rsp.json();
  }

  // Products endpoints
  async getProducts() {
    const rsp = await this.GET('api/producto/');
    return rsp.json();
  }

  async getProduct(id) {
    const rsp = await this.GET(`api/producto/${id}`);
    return rsp.json();
  }

  async createProduct(productData) {
    const rsp = await this.POST('api/producto', productData, true);
    return rsp.json();
  }

  async updateProduct(id, productData) {
    const rsp = await this.PATCH(`api/${id}`, productData, true);
    return rsp.json();
  }

  async deleteProduct(id) {
    const rsp = await this.DELETE(`api/producto/${id}`);
    return rsp.json();
  }

  // Categories endpoints
  async getCategories() {
    const rsp = await this.GET('api/categoria/');
    return rsp.json();
  }

  async createCategory(nombre) {
    const rsp = await this.POST('api/categoria', nombre);
    return rsp.json();
  }

  async updateCategory(id, nombre, estado) {
    const rsp = await this.PATCH(`api/categoria/${id}`, { nombre: nombre, estado: estado });
    return rsp.json();
  }

  async deleteCategory(id) {
    const rsp = await this.DELETE(`api/categoria/${id}`);
    return rsp.json();
  }

  // Orders endpoints
  async getOrders() {
    const rsp = await this.GET('admin/pedidos/');
    return rsp.json();
  }

  async updateOrder(orderData) {
    const rsp = await this.PATCH(`api/ordenes/${orderData.id}`, orderData);
    return rsp.json();
  }

  async deleteOrder(id) {
    const rsp = await this.DELETE(`api/ordenes/${id}`);
    return rsp.json();
  }

}

export default new ApiService();