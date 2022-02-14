import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import pagination from './pagination.js';

const apiUrl= 'https://vue3-course-api.hexschool.io/v2' ;
const apiPath= 'phil' ;



let productModal = null;
let delProductModal = null;

const app = createApp({
  components: {
    pagination
  },
  data() {
    return {
      
      
      products: [],
      isNew: false,
      pagination: {},
      tempProduct: {
        imagesUrl: [],
      },
    }
  },
  mounted() {
    // bs5 modol初始化方法
    productModal = new bootstrap.Modal(document.getElementById('productModal'), {
      keyboard: false
    });

    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false
    });

    // 取出 Token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;

    this.checkAdmin();
  },
  methods: {
    checkAdmin() {
      const url = `${apiUrl}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getData();
        })
        // 資料輸入錯誤，轉址回登入頁面
        .catch((err) => {
          alert(err.data.message)
          window.location = 'login.html';
        })
    },
    getData(page = 1) { //參數設定
      // query 為?後面的page=${page}
      // 參數預設值page=1
      const url = `${apiUrl}/api/${apiPath}/admin/products/?page=${page}`;
      axios.get(url).then((response) => {
        this.products = response.data.products;
        this.pagination = response.data.pagination;
      }).catch((err) => {
        alert(err.data.message);
      })
    },
    
    openModal(isNew, item) {
      if (isNew === 'new') {
        this.tempProduct = {
          // 將圖片設為空值，以利置入設定
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      } else if (isNew === 'edit') {
        // 將物件以淺拷貝的方式呈現，避免輸入值同步呈現於樣板上{...}
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (isNew === 'delete') {
        this.tempProduct = { ...item };
        delProductModal.show()
      }
    },
    delProduct() {
      const url = `${apiUrl}/api/${apiPath}/admin/product/${this.tempProduct.id}`;

      axios.delete(url).then((response) => {
        alert(response.data.message);
        delProductModal.hide();
        this.getData();
      }).catch((err) => {
        alert(err.data.message);
      })
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
});

app.component('productModal', {
  props:['tempProduct','isNew'],
  template:'#templateForProductModal' ,
  methods:{
    updateProduct() {
      let url = `${apiUrl}/api/${apiPath}/admin/product`;
      let http = 'post';
      console.log('updateProduct', this.isNew); 
      // put資料時，按照api格式需要帶入id
      // !this.isNew是要符合下方edit中的put設定條件
      if (!this.isNew) {
        url = `${apiUrl}/api/${apiPath}/admin/product/${this.tempProduct.id}`;
        http = 'put'
      }

      axios[http](url, { data: this.tempProduct }).then((response) => {
        alert(response.data.message);
        this.$emit('get-products')
        productModal.hide();
        // this.getData(); 無getData(外層方法)
      }).catch((err) => {
        alert(err.data.message);
      })
    },
  }
})
app.mount('#app');
