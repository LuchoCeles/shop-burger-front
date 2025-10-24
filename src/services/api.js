const API_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async POST(url, data, isFormData = false, SecondToken = null) {
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    if (token) {
      headers['Authorization-Second'] = `Bearer ${SecondToken}`;
    }

    const config = {
      method: 'POST',
      mode: 'cors',
      headers: headers,
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
  async getProducts(soloActivos = true) {
    const rsp = await this.GET(`api/producto/${soloActivos}/`);
    return rsp.json();
  }

  async getProduct(id) {
    const rsp = await this.GET(`api/producto/${id}`);
    return rsp.json();
  }

  async createProduct(productData) {
    const rsp = await this.POST('api/producto/', productData, true);
    return rsp.json();
  }

  async updateProduct(id, productData) {
    const rsp = await this.PATCH(`api/producto/${id}`, productData, true);
    return rsp.json();
  }

  async updateStateProduct(id, estado) {
    const rsp = await this.PATCH(`api/producto/${id}/estado`, { estado: estado });
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
    const rsp = await this.POST('api/categoria/', { nombre: nombre });
    return rsp.json();
  }

  async updateCategory(id, nombre) {
    const rsp = await this.PATCH(`api/categoria/${id}`, { nombre: nombre });
    return rsp.json();
  }

  async updateStateCategory(id, estado) {
    const rsp = await this.PATCH(`api/categoria/${id}/estado`, { estado: estado });
    return rsp.json();
  }

  async deleteCategory(id) {
    const rsp = await this.DELETE(`api/categoria/${id}`);
    return rsp.json();
  }

  // Orders endpoints
  async getOrders() {
    const rsp = await this.GET('admin/pedido');
    return rsp.json();
  }

  async createOrder(productData) {
    const rsp = await this.POST('admin/pedido', productData);
    return rsp.json();
  }

  async updateOrder(orderData) {
    const rsp = await this.PATCH(`admin/pedido/estado`, orderData);
    return rsp.json();
  }

  async deleteOrder(id) {
    const rsp = await this.DELETE(`admin/pedido/${id}`);
    return rsp.json();
  }

  // Adicionales endpoints
  async getAdicionales() {
    const rsp = await this.GET('api/adicional/');
    return rsp.json();
  }

  async createAdicional(adicionalData) {
    const rsp = await this.POST('api/adicional/create', adicionalData);
    return rsp.json();
  }

  async updateAdicional(id, adicionalData) {
    const rsp = await this.PATCH(`api/adicional/${id}`, adicionalData);
    return rsp.json();
  }

  async deleteAdicional(id) {
    const rsp = await this.DELETE(`api/adicional/${id}`);
    return rsp.json();
  }

  async changeState(id) {
    const rsp = await this.PATCH(`api/adicional/${id}/state`);
    return rsp.json();
  }

  // Conexion entre productos y adicionales

  async addAdicionalToProducto(idProducto, idAdicional) {
    const rsp = await this.POST('admin/adicionalxproducto/create', { idProducto, idAdicional });
    return rsp.json();
  }

  async removeAdicionalFromProducto(idAxP) {
    const rsp = await this.DELETE(`admin/adicionalxproducto/${idAxP}`);
    return rsp.json();
  }

  async updateAdicionalXProducto(idAxP, idProducto, adicionales) {
    const rsp = await this.PATCH(`admin/adicionalxproducto/${idAxP}`, { idProducto, adicionales });
    return rsp.json();
  }

  async getProductoAdicionales(idProducto) {
    const rsp = await this.GET(`admin/adicionalxproducto/${idProducto}`);
    return rsp.json();
  }

  // Bancos endpoints
  async getBancos() {
    const rsp = await this.GET('admin/banco/');
    return rsp.json();
  }

  async loginBanco(cuit, password) {
    const rsp = await this.POST('admin/banco/login', { cuit, password });
    return rsp.json();
  }

  async updateBanco(id, bancoData) {
    const rsp = await this.PATCH(`admin/banco/${id}`, { banco: bancoData }, false, localStorage.getItem('bancoToken'));
    return rsp.json();
  }

}

export default new ApiService();