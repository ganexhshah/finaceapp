import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';
import Alert from '@/components/alert';
import api from '@/lib/api';

export default function ManageCategoriesScreen() {
  const [selectedTab, setSelectedTab] = useState<'income' | 'expense'>('expense');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.getCategories(selectedTab);
      if (res.success && res.data) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    setLoading(true);
    loadCategories();
  }, [loadCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteClick = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCategoryId) {
      try {
        const res = await api.deleteCategory(deletingCategoryId);
        if (res.success) {
          await loadCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
    setDeletingCategoryId(null);
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Manage Categories" showBack={true} />
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'expense' && styles.tabActive]}
          onPress={() => setSelectedTab('expense')}
        >
          <Text style={[styles.tabText, selectedTab === 'expense' && styles.tabTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'income' && styles.tabActive]}
          onPress={() => setSelectedTab('income')}
        >
          <Text style={[styles.tabText, selectedTab === 'income' && styles.tabTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color="#2563eb" />
          </View>
        ) : categories.length > 0 ? (
          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[
                    styles.categoryIcon,
                    { backgroundColor: selectedTab === 'expense' ? '#fee2e2' : '#d1fae5' }
                  ]}>
                    <Ionicons 
                      name={category.icon as any} 
                      size={24} 
                      color={selectedTab === 'expense' ? '#ef4444' : '#10b981'} 
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>

                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(category)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={20} color="#2563eb" />
                  </TouchableOpacity>

                  {!category.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteClick(category.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>
      </View>

      <EditCategoryModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        type={selectedTab}
        onSave={async (updatedCategory) => {
          try {
            const res = await api.updateCategory(updatedCategory.id, {
              name: updatedCategory.name,
              icon: updatedCategory.icon,
            });
            if (res.success) {
              await loadCategories();
            }
          } catch (error) {
            console.error('Error updating category:', error);
          }
          setShowEditModal(false);
          setEditingCategory(null);
        }}
      />

      <AddCategoryModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={selectedTab}
        onSave={async (newCategory) => {
          try {
            const res = await api.createCategory({
              name: newCategory.name,
              icon: newCategory.icon,
              type: selectedTab,
            });
            if (res.success) {
              await loadCategories();
            }
          } catch (error) {
            console.error('Error creating category:', error);
          }
          setShowAddModal(false);
        }}
      />

      <Alert
        visible={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setDeletingCategoryId(null);
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
}

// Edit Category Modal
interface EditCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  category: any;
  type: 'income' | 'expense';
  onSave: (category: any) => void;
}

function EditCategoryModal({ visible, onClose, category, type, onSave }: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

  React.useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setSelectedIcon(category.icon);
    }
  }, [category]);

  const availableIcons = [
    'restaurant', 'car', 'cart', 'game-controller', 'receipt', 'fitness',
    'school', 'airplane', 'home', 'cafe', 'bus', 'train',
    'bicycle', 'walk', 'medical', 'heart', 'book', 'laptop',
    'phone-portrait', 'shirt', 'gift', 'paw', 'leaf', 'water',
    'wallet', 'briefcase', 'trending-up', 'business', 'cash', 'card',
  ];

  const handleSave = () => {
    if (categoryName.trim() && selectedIcon) {
      onSave({
        ...category,
        name: categoryName.trim(),
        icon: selectedIcon,
      });
    }
  };

  if (!category) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Travel"
                placeholderTextColor="#9ca3af"
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {availableIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconItem,
                      selectedIcon === icon && styles.iconItemActive,
                      { 
                        backgroundColor: selectedIcon === icon 
                          ? (type === 'expense' ? '#fee2e2' : '#d1fae5')
                          : '#f9fafb',
                        borderColor: selectedIcon === icon
                          ? (type === 'expense' ? '#ef4444' : '#10b981')
                          : '#e5e7eb'
                      }
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={selectedIcon === icon 
                        ? (type === 'expense' ? '#ef4444' : '#10b981')
                        : '#6b7280'
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                { backgroundColor: type === 'expense' ? '#ef4444' : '#10b981' }
              ]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Add Category Modal
interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSave: (category: any) => void;
}

function AddCategoryModal({ visible, onClose, type, onSave }: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

  const availableIcons = [
    'restaurant', 'car', 'cart', 'game-controller', 'receipt', 'fitness',
    'school', 'airplane', 'home', 'cafe', 'bus', 'train',
    'bicycle', 'walk', 'medical', 'heart', 'book', 'laptop',
    'phone-portrait', 'shirt', 'gift', 'paw', 'leaf', 'water',
    'wallet', 'briefcase', 'trending-up', 'business', 'cash', 'card',
  ];

  const handleSave = () => {
    if (categoryName.trim() && selectedIcon) {
      onSave({
        name: categoryName.trim(),
        icon: selectedIcon,
      });
      setCategoryName('');
      setSelectedIcon('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Travel"
                placeholderTextColor="#9ca3af"
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {availableIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconItem,
                      selectedIcon === icon && styles.iconItemActive,
                      { 
                        backgroundColor: selectedIcon === icon 
                          ? (type === 'expense' ? '#fee2e2' : '#d1fae5')
                          : '#f9fafb',
                        borderColor: selectedIcon === icon
                          ? (type === 'expense' ? '#ef4444' : '#10b981')
                          : '#e5e7eb'
                      }
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={selectedIcon === icon 
                        ? (type === 'expense' ? '#ef4444' : '#10b981')
                        : '#6b7280'
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                { backgroundColor: type === 'expense' ? '#ef4444' : '#10b981' }
              ]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  categoriesList: {
    padding: 20,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconItemActive: {
    borderWidth: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
