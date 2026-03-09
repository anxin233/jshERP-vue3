<script setup lang="ts">
/**
 * UserMenu - User dropdown menu in header
 * Migrated from Vue 2 components/tools/UserMenu.vue
 * Uses Element Plus + Composition API
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Lock, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getStore } from '@/utils/storage'
import UserPassword from './UserPassword.vue'

const router = useRouter()
const userStore = useUserStore()

const passwordDialogVisible = ref(false)

/** Current user info from store */
const userInfo = computed(() => {
  const storedInfo = getStore('Login_Userinfo')
  return {
    id: String(storedInfo?.id || ''),
    loginName: storedInfo?.loginName || userStore.username || '用户',
    avatar: storedInfo?.avatar || userStore.avatar || ''
  }
})

/** Avatar fallback: show first character of loginName */
const avatarText = computed(() => {
  const name = userInfo.value.loginName
  return name ? name.charAt(0).toUpperCase() : 'U'
})

/** Handle dropdown menu command */
function handleCommand(command: string | number | object) {
  if (command === 'password') {
    passwordDialogVisible.value = true
  } else if (command === 'logout') {
    handleLogout()
  }
}

/** Logout with confirmation */
function handleLogout() {
  ElMessageBox.confirm('真的要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await userStore.logout()
      router.push('/user/login')
    })
    .catch(() => {
      // user cancelled
    })
}
</script>

<template>
  <div class="user-menu-wrapper">
    <el-dropdown trigger="click" @command="handleCommand">
      <span class="user-dropdown-link">
        <el-avatar v-if="userInfo.avatar" :size="24" :src="userInfo.avatar" />
        <el-avatar v-else :size="24" class="avatar-text">{{ avatarText }}</el-avatar>
        <span class="username">{{ userInfo.loginName }}</span>
        <el-icon class="arrow-icon"><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="password">
            <el-icon><Lock /></el-icon>
            修改密码
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- Password change dialog -->
    <UserPassword v-model:visible="passwordDialogVisible" :user-id="userInfo.id" />
  </div>
</template>

<style scoped>
.user-menu-wrapper {
  display: flex;
  align-items: center;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: 48px;
  transition: background-color 0.3s;
  outline: none;
}

.user-dropdown-link:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.avatar-text {
  background-color: #1890ff;
  color: #fff;
  font-size: 12px;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #999;
}
</style>
