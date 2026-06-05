<template>
  <div :id="containerId" ref="containerRef" style="position: relative">

    <!--  ---------------------------- begin 图片左右换位置 ------------------------------------- -->
    <div class="movety-container" :style="{top:top+'px',left:left+'px',display:moveDisplay}" style="padding:0 8px;position: absolute;z-index: 91;height: 32px;width: 104px;text-align: center;">
      <div :id="containerId+'-mover'" ref="moverRef" :class="showMoverTask?'uploadty-mover-mask':'movety-opt'" style="margin-top: 12px">
        <a @click="moveLast" style="margin: 0 5px;"><legacy-icon type="arrow-left" style="color: #fff;font-size: 16px"/></a>
        <a @click="moveNext" style="margin: 0 5px;"><legacy-icon type="arrow-right" style="color: #fff;font-size: 16px"/></a>
      </div>
    </div>
    <!--  ---------------------------- end 图片左右换位置 ------------------------------------- -->

    <a-upload
      name="file"
      :multiple="true"
      :action="uploadAction"
      :headers="headers"
      :data="{'biz':bizPath}"
      :fileList="fileList"
      :beforeUpload="beforeUpload"
      @change="handleChange"
      :disabled="disabled"
      :returnUrl="returnUrl"
      :listType="complistType"
      @preview="handlePreview"
      :class="{'uploadty-disabled':disabled}">
      <template>
        <div v-if="isImageComp">
          <legacy-icon type="plus" />
          <div class="ant-upload-text">{{ text }}</div>
        </div>
        <a-button v-else-if="buttonVisible">
         <legacy-icon type="upload" />{{ text }}
        </a-button>
      </template>
    </a-upload>
    <a-modal :open="previewVisible" :width="1000" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import { getFileAccessHttpUrl } from '@/api/manage';
  import { fileSizeLimit } from '@/api/api'
  import storage from '@/utils/storage'

  const FILE_TYPE_ALL = "all"
  const FILE_TYPE_IMG = "image"
  const FILE_TYPE_TXT = "file"
  const uidGenerator=()=>{
    return '-'+parseInt(Math.random()*10000+1,10);
  }
  const getFileName=(path)=>{
    if(path.lastIndexOf("\\")>=0){
      let reg=new RegExp("\\\\","g");
      path = path.replace(reg,"/");
    }
    return path.substring(path.lastIndexOf("/")+1);
  }
  export default {
    name: 'JUpload',
    data(){
      return {
        uploadAction:window._CONFIG['domianURL']+"/systemConfig/upload",
        headers:{},
        fileList: [],
        newFileList: [],
        uploadGoOn:true,
        previewVisible: false,
        //---------------------------- begin 图片左右换位置 -------------------------------------
        previewImage: '',
        containerId:'',
        top:'',
        left:'',
        moveDisplay:'none',
        showMoverTask:false,
        moverHold:false,
        currentImg:'',
        //---------------------------- end 图片左右换位置 -------------------------------------
        _moverRetryTimer: null,
        _moverListenersBound: false,
        _moverMouseOver: null,
        _moverMouseOut: null,
        _picMouseOver: null,
        _picMouseOut: null,
        sizeLimit: 0
      }
    },
    props:{
      text:{
        type:String,
        required:false,
        default:"点击上传"
      },
      fileType:{
        type:String,
        required:false,
        default:FILE_TYPE_ALL
      },
      /*这个属性用于控制文件上传的业务路径*/
      bizPath:{
        type:String,
        required:false,
        default:"temp"
      },
      value:{
        type:[String,Array],
        required:false
      },
      // update-begin- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
      disabled:{
        type:Boolean,
        required:false,
        default: false
      },
      // update-end- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
      //此属性被废弃了
      triggerChange:{
        type: Boolean,
        required: false,
        default: false
      },
      /**
       * update -- author:lvdandan -- date:20190219 -- for:Jupload组件增加是否返回url，
       * true：仅返回url
       * false：返回fileName filePath fileSize
       */
      returnUrl:{
        type:Boolean,
        required:false,
        default: true
      },
      number:{
        type:Number,
        required:false,
        default: 0
      },
      buttonVisible:{
        type:Boolean,
        required:false,
        default: true
      },
    },
    watch:{
      value:{
        immediate: true,
        handler() {
          let val = this.value
          if (val instanceof Array) {
            if(this.returnUrl){
              this.initFileList(val.join(','))
            }else{
              this.initFileListArr(val);
            }
          } else {
            this.initFileList(val)
          }
        }
      }
    },
    computed:{
      isImageComp(){
        return this.fileType === FILE_TYPE_IMG
      },
      complistType(){
        return this.fileType === FILE_TYPE_IMG?'picture-card':'text'
      }
    },
    created(){
      this.initFileSizeLimit()
      const token = storage.get(ACCESS_TOKEN);
      //---------------------------- begin 图片左右换位置 -------------------------------------
      this.headers = {"X-Access-Token":token};
      this.containerId = 'container-ty-'+new Date().getTime();
      //---------------------------- end 图片左右换位置 -------------------------------------
    },

    methods:{
      emitValue(value) {
        this.$emit('change', value)
        this.$emit('input', value)
        this.$emit('update:value', value)
        this.$emit('update:modelValue', value)
      },
      initFileSizeLimit() {
        fileSizeLimit().then((res)=>{
          if(res.code === 200) {
            this.sizeLimit = res.data
          }
        })
      },
      initFileListArr(val){
        if(!val || val.length==0){
          this.fileList = [];
          return;
        }
        let fileList = [];
        for(var a=0;a<val.length;a++){
          let url = getFileAccessHttpUrl(val[a].filePath);
          fileList.push({
            uid:uidGenerator(),
            name:val[a].fileName,
            status: 'done',
            url: url,
            response:{
              code:"history",
              data:val[a].filePath
            }
          })
        }
        this.fileList = fileList
      },
      initFileList(paths){
        if(!paths || paths.length==0){
          //return [];
          // update-begin- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
          this.fileList = [];
          return;
          // update-end- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
        }
        let fileList = [];
        let arr = paths.split(",")
        for(var a=0;a<arr.length;a++){
          let url = getFileAccessHttpUrl('systemConfig/static/' + arr[a]);
          fileList.push({
            uid:uidGenerator(),
            name:getFileName(arr[a]),
            status: 'done',
            url: url,
            response:{
              code:"history",
              data:arr[a]
            }
          })
        }
        this.fileList = fileList
      },
      handlePathChange(){
        let uploadFiles = this.fileList
        let path = ''
        if(!uploadFiles || uploadFiles.length==0){
          path = ''
        }
        let arr = [];

        for(var a=0;a<uploadFiles.length;a++){
          arr.push(uploadFiles[a].response.data)
        }
        if(arr.length>0){
          path = arr.join(",")
        }
        this.emitValue(path);
      },
      beforeUpload(file){
        this.uploadGoOn=true
        let fileType = file.type;
        let fileSize = file.size;
        if(this.fileType===FILE_TYPE_IMG){
          if(fileType.indexOf('image')<0){
            this.$message.warning('请上传图片');
            this.uploadGoOn=false
            return false;
          }
        }
        //验证文件大小
        if(fileSize>this.sizeLimit) {
          let parseSizeLimit = (this.sizeLimit/1024/1024).toFixed(2)
          this.$message.warning('抱歉，文件大小不能超过' + parseSizeLimit + 'M');
          this.uploadGoOn=false
          return false;
        }
        return true
      },
      handleChange(info) {
        console.log("--文件列表改变--")
        if(!info.file.status && this.uploadGoOn === false){
          info.fileList.pop();
        }
        let fileList = info.fileList
        if(info.file.status==='done'){
          if(this.number>0){
            fileList = fileList.slice(-this.number);
          }
          if(info.file.response.code === 200){
            fileList = fileList.map((file) => {
              if (file.response) {
                let reUrl = file.response.data;
                file.url = getFileAccessHttpUrl(reUrl);
              }
              return file;
            });
          }
          //this.$message.success(`${info.file.name} 上传成功!`);
        }else if (info.file.status === 'error') {
          this.$message.error(`${info.file.name} 上传失败.`);
        }else if(info.file.status === 'removed'){
          this.handleDelete(info.file)
        }
        this.fileList = fileList
        if(info.file.status==='done' || info.file.status === 'removed'){
          //returnUrl为true时仅返回文件路径
          if(this.returnUrl){
            this.handlePathChange()
          }else{
            //returnUrl为false时返回文件名称、文件路径及文件大小
            this.newFileList = [];
            for(var a=0;a<fileList.length;a++){
              var fileJson = {
                fileName:fileList[a].name,
                filePath:fileList[a].response.data,
                fileSize:fileList[a].size
              };
              this.newFileList.push(fileJson);
            }
            this.emitValue(this.newFileList);
          }
        }
      },
      handleDelete(file){
        //如有需要新增 删除逻辑
        console.log(file)
      },
      handlePreview(file){
        let postfix = file.name.substring(file.name.lastIndexOf('.'))
        if(postfix === '.gif' || postfix === '.jpg' || postfix === '.jpeg' || postfix === '.png' ||
          postfix === '.GIF' || postfix === '.JPG' || postfix === '.JPEG' || postfix === '.PNG') {
          this.previewImage = file.url || file.thumbUrl;
          this.previewVisible = true;
        }else{
          location.href=file.url
        }
      },
      handleCancel(){
        this.previewVisible = false;
      },
      //---------------------------- begin 图片左右换位置 -------------------------------------
      moveLast(){
        //console.log(ev)
        //console.log(this.fileList)
        //console.log(this.currentImg)
        let index = this.getIndexByUrl();
        if(index==0){
          this.$message.warn('未知的操作')
        }else{
          let curr = this.fileList[index].url;
          let last = this.fileList[index-1].url;
          let arr =[]
          for(let i=0;i<this.fileList.length;i++){
            if(i==index-1){
              arr.push(curr)
            }else if(i==index){
              arr.push(last)
            }else{
              arr.push(this.fileList[i].url)
            }
          }
          this.currentImg = last
          this.emitValue(arr.join(','))
        }
      },
      moveNext(){
        let index = this.getIndexByUrl();
        if(index==this.fileList.length-1){
          this.$message.warn('已到最后~')
        }else{
          let curr = this.fileList[index].url;
          let next = this.fileList[index+1].url;
          let arr =[]
          for(let i=0;i<this.fileList.length;i++){
            if(i==index+1){
              arr.push(curr)
            }else if(i==index){
              arr.push(next)
            }else{
              arr.push(this.fileList[i].url)
            }
          }
          this.currentImg = next
          this.emitValue(arr.join(','))
        }
      },
      getIndexByUrl(){
        for(let i=0;i<this.fileList.length;i++){
          if(this.fileList[i].url === this.currentImg || encodeURI(this.fileList[i].url) === this.currentImg){
            return i;
          }
        }
        return -1;
      },

      clearMoverRetryTimer() {
        if (this._moverRetryTimer) {
          clearTimeout(this._moverRetryTimer)
          this._moverRetryTimer = null
        }
      },

      getMoverEl() {
        return this.$refs.moverRef || document.getElementById(this.containerId + '-mover')
      },

      getContainerEl() {
        return this.$refs.containerRef || document.getElementById(this.containerId)
      },

      teardownMoverListeners() {
        const moverObj = this.getMoverEl()
        if (moverObj) {
          if (this._moverMouseOver) {
            moverObj.removeEventListener('mouseover', this._moverMouseOver)
          }
          if (this._moverMouseOut) {
            moverObj.removeEventListener('mouseout', this._moverMouseOut)
          }
        }
        const container = this.getContainerEl()
        if (container) {
          const picList = container.getElementsByClassName('ant-upload-list-picture-card')
          if (picList && picList.length > 0 && this._picMouseOver) {
            picList[0].removeEventListener('mouseover', this._picMouseOver)
          }
          if (picList && picList.length > 0 && this._picMouseOut) {
            picList[0].removeEventListener('mouseout', this._picMouseOut)
          }
        }
        this._moverListenersBound = false
        this._moverMouseOver = null
        this._moverMouseOut = null
        this._picMouseOver = null
        this._picMouseOut = null
      },

      /** 图片左右切换：绑定 hover 事件（弹窗未打开时 DOM 可能未就绪） */
      initMoverListeners() {
        this.clearMoverRetryTimer()
        const moverObj = this.getMoverEl()
        if (!moverObj) {
          const scheduleRetry = (attempt = 0) => {
            if (this.getMoverEl() || attempt >= 120) {
              if (this.getMoverEl()) {
                this.initMoverListeners()
              }
              return
            }
            this._moverRetryTimer = setTimeout(() => scheduleRetry(attempt + 1), 50)
          }
          this.$nextTick(() => scheduleRetry(0))
          return
        }

        this.teardownMoverListeners()

        this._moverMouseOver = () => {
          this.moverHold = true
          this.moveDisplay = 'block'
        }
        this._moverMouseOut = () => {
          this.moverHold = false
          this.moveDisplay = 'none'
        }
        moverObj.addEventListener('mouseover', this._moverMouseOver)
        moverObj.addEventListener('mouseout', this._moverMouseOut)

        const container = this.getContainerEl()
        const picList = container
          ? container.getElementsByClassName('ant-upload-list-picture-card')
          : []
        if (picList && picList.length > 0) {
          this._picMouseOver = (ev) => {
            ev = ev || window.event
            const target = ev.target || ev.srcElement
            if (target.className === 'ant-upload-list-item-info') {
              this.showMoverTask = false
              const item = target.parentElement
              this.left = item.offsetLeft
              this.top = item.offsetTop + item.offsetHeight - 50
              this.moveDisplay = 'block'
              const img = target.getElementsByTagName('img')[0]
              if (img) {
                this.currentImg = img.src
              }
            }
          }
          this._picMouseOut = (ev) => {
            ev = ev || window.event
            const target = ev.target || ev.srcElement
            if (target.className === 'ant-upload-list-item-info') {
              this.showMoverTask = true
              setTimeout(() => {
                if (this.moverHold === false) {
                  this.moveDisplay = 'none'
                }
              }, 100)
            }
            if (
              target.className === 'ant-upload-list-item ant-upload-list-item-done' ||
              target.className === 'ant-upload-list ant-upload-list-picture-card'
            ) {
              this.moveDisplay = 'none'
            }
          }
          picList[0].addEventListener('mouseover', this._picMouseOver)
          picList[0].addEventListener('mouseout', this._picMouseOut)
        }

        this._moverListenersBound = true
      }
    },
    mounted() {
      if (this.isImageComp) {
        this.initMoverListeners()
      }
    },
    activated() {
      if (this.isImageComp) {
        this._moverListenersBound = false
        this.initMoverListeners()
      }
    },
    updated() {
      if (this.isImageComp && !this._moverListenersBound) {
        this.$nextTick(() => this.initMoverListeners())
      }
    },
    beforeUnmount() {
      this.clearMoverRetryTimer()
      this.teardownMoverListeners()
    }
  }
</script>

<style lang="less">
.uploadty-disabled{
  .ant-upload-list-item {
    .anticon-close{
      display: none;
    }
    .anticon-delete{
      display: none;
    }
  }
}
  //---------------------------- begin 图片左右换位置 -------------------------------------
  .uploadty-mover-mask{
    background-color: rgba(0, 0, 0, 0.5);
    opacity: .8;
    color: #fff;
    height: 28px;
    line-height: 28px;
  }
  //---------------------------- end 图片左右换位置 -------------------------------------
</style>