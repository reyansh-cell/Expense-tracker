// Personal Expense Tracker JavaScript

class ExpenseTracker {
    constructor() {
        // Initialize with sample data
        this.expenses = [
            {
                id: 1,
                amount: 250,
                category: "Food",
                description: "Lunch at college cafeteria",
                date: "2025-10-05"
            },
            {
                id: 2,
                amount: 1200,
                category: "Travel",
                description: "Monthly metro pass",
                date: "2025-10-01"
            },
            {
                id: 3,
                amount: 500,
                category: "Shopping",
                description: "Study materials and notebooks",
                date: "2025-10-03"
            },
            {
                id: 4,
                amount: 180,
                category: "Entertainment",
                description: "Movie ticket",
                date: "2025-10-04"
            },
            {
                id: 5,
                amount: 2500,
                category: "Bills",
                description: "Mobile recharge",
                date: "2025-09-28"
            }
        ];

        this.categories = [
            "Food", "Travel", "Shopping", "Entertainment", 
            "Bills", "Healthcare", "Education", "Other"
        ];

        this.categoryIcons = {
            "Food": "🍽️",
            "Travel": "✈️",
            "Shopping": "🛍️", 
            "Entertainment": "🎬",
            "Bills": "💳",
            "Healthcare": "🏥",
            "Education": "📚",
            "Other": "📄"
        };

        this.currentFilter = '';
        this.currentSearch = '';
        this.editingId = null;
        this.nextId = 6; // Next available ID

        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.setDefaultDate();
        this.renderExpenses();
        this.updateTotal();
        this.updateStats();
        this.updateExpenseCount();
    }

    bindEvents() {
        // Form submission
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel edit
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderExpenses();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderExpenses();
        });

        // Export and clear buttons
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.showConfirmModal('Are you sure you want to clear all expenses? This action cannot be undone.', () => {
                this.clearAllExpenses();
            });
        });

        // Modal events
        document.getElementById('cancelConfirm').addEventListener('click', () => {
            this.hideConfirmModal();
        });

        document.getElementById('confirmAction').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
            }
            this.hideConfirmModal();
        });

        // Close modal on backdrop click
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__backdrop')) {
                this.hideConfirmModal();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        if (this.editingId) {
            this.updateExpense(this.editingId, formData);
            this.showMessage('Expense updated successfully!', 'success');
        } else {
            this.addExpense(formData);
            this.showMessage('Expense added successfully!', 'success');
        }

        this.resetForm();
        this.renderExpenses();
        this.updateTotal();
        this.updateStats();
        this.updateExpenseCount();
    }

    getFormData() {
        return {
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value.trim()
        };
    }

    validateForm(data) {
        if (!data.amount || data.amount <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return false;
        }

        if (!data.category) {
            this.showMessage('Please select a category', 'error');
            return false;
        }

        if (!data.date) {
            this.showMessage('Please select a date', 'error');
            return false;
        }

        return true;
    }

    addExpense(data) {
        const expense = {
            id: this.nextId++,
            ...data
        };
        this.expenses.unshift(expense); // Add to beginning for newest first
    }

    updateExpense(id, data) {
        const index = this.expenses.findIndex(expense => expense.id === id);
        if (index !== -1) {
            this.expenses[index] = { ...this.expenses[index], ...data };
        }
    }

    deleteExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.renderExpenses();
        this.updateTotal();
        this.updateStats();
        this.updateExpenseCount();
        this.showMessage('Expense deleted successfully!', 'success');
    }

    editExpense(id) {
        const expense = this.expenses.find(e => e.id === id);
        if (!expense) return;

        // Fill form with expense data
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date;
        document.getElementById('description').value = expense.description;

        // Update UI for editing mode
        this.editingId = id;
        document.getElementById('submitBtnText').textContent = 'Update Expense';
        document.getElementById('cancelBtn').style.display = 'inline-flex';

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        this.editingId = null;
        this.resetForm();
    }

    resetForm() {
        document.getElementById('expenseForm').reset();
        this.setDefaultDate();
        this.editingId = null;
        document.getElementById('submitBtnText').textContent = 'Add Expense';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    renderExpenses() {
        const container = document.getElementById('expensesList');
        const emptyState = document.getElementById('emptyState');
        
        let filteredExpenses = this.expenses;

        // Apply category filter
        if (this.currentFilter) {
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.category === this.currentFilter
            );
        }

        // Apply search filter
        if (this.currentSearch) {
            filteredExpenses = filteredExpenses.filter(expense =>
                expense.description.toLowerCase().includes(this.currentSearch) ||
                expense.category.toLowerCase().includes(this.currentSearch)
            );
        }

        if (filteredExpenses.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = filteredExpenses.map(expense => 
            this.createExpenseHTML(expense)
        ).join('');

        // Add event listeners to action buttons
        this.bindExpenseActions();
    }

    createExpenseHTML(expense) {
        const formattedDate = this.formatDate(expense.date);
        const icon = this.categoryIcons[expense.category] || '📄';
        
        return `
            <div class="expense-item" data-category="${expense.category}">
                <div class="expense-item__left">
                    <div class="expense-item__icon">${icon}</div>
                    <div class="expense-item__details">
                        <div class="expense-item__category">${expense.category}</div>
                        <div class="expense-item__description">${expense.description || 'No description'}</div>
                        <div class="expense-item__date">${formattedDate}</div>
                    </div>
                </div>
                <div class="expense-item__right">
                    <div class="expense-item__amount">₹${expense.amount.toFixed(2)}</div>
                    <div class="expense-item__actions">
                        <button class="action-btn action-btn--edit" onclick="expenseTracker.editExpense(${expense.id})" title="Edit expense">
                            ✏️
                        </button>
                        <button class="action-btn action-btn--delete" onclick="expenseTracker.confirmDelete(${expense.id})" title="Delete expense">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindExpenseActions() {
        // Actions are bound via onclick attributes in createExpenseHTML
        // This method is kept for consistency but not needed with current implementation
    }

    confirmDelete(id) {
        this.showConfirmModal('Are you sure you want to delete this expense?', () => {
            this.deleteExpense(id);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-IN', options);
    }

    updateTotal() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
    }

    updateStats() {
        const stats = this.calculateStats();
        const container = document.getElementById('statsCards');
        
        container.innerHTML = Object.entries(stats).map(([category, amount]) => {
            const icon = this.categoryIcons[category] || '📄';
            return `
                <div class="stat-card">
                    <div class="stat-card__icon">${icon}</div>
                    <div class="stat-card__label">${category}</div>
                    <div class="stat-card__value">₹${amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    calculateStats() {
        const stats = {};
        
        this.expenses.forEach(expense => {
            if (stats[expense.category]) {
                stats[expense.category] += expense.amount;
            } else {
                stats[expense.category] = expense.amount;
            }
        });

        // Sort by amount (highest first)
        const sortedStats = Object.entries(stats)
            .sort(([,a], [,b]) => b - a)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        return sortedStats;
    }

    updateExpenseCount() {
        const count = this.expenses.length;
        const countText = count === 1 ? '1 expense' : `${count} expenses`;
        document.getElementById('expenseCount').textContent = countText;
    }

    exportToCSV() {
        if (this.expenses.length === 0) {
            this.showMessage('No expenses to export', 'error');
            return;
        }

        const headers = ['Date', 'Category', 'Amount', 'Description'];
        const csvContent = [
            headers.join(','),
            ...this.expenses.map(expense => [
                expense.date,
                expense.category,
                expense.amount,
                `"${expense.description || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.showMessage('Expenses exported successfully!', 'success');
    }

    clearAllExpenses() {
        this.expenses = [];
        this.renderExpenses();
        this.updateTotal();
        this.updateStats();
        this.updateExpenseCount();
        this.resetForm();
        this.showMessage('All expenses cleared!', 'success');
    }

    showMessage(text, type = 'success') {
        const message = document.getElementById('message');
        const messageText = message.querySelector('.message__text');
        
        messageText.textContent = text;
        message.className = `message message--${type}`;
        message.style.display = 'block';
        
        // Trigger animation
        setTimeout(() => message.classList.add('show'), 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                message.style.display = 'none';
            }, 250);
        }, 3000);
    }

    showConfirmModal(message, callback) {
        this.confirmCallback = callback;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideConfirmModal() {
        document.getElementById('confirmModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.confirmCallback = null;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('confirmModal');
        if (!modal.classList.contains('hidden')) {
            window.expenseTracker.hideConfirmModal();
        }
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('expenseForm');
        if (document.activeElement && form.contains(document.activeElement)) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Add some utility functions for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Auto-focus first input when page loads
    setTimeout(() => {
        document.getElementById('amount').focus();
    }, 100);
    
    // Format amount input on blur
    document.getElementById('amount').addEventListener('blur', (e) => {
        if (e.target.value) {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                e.target.value = value.toFixed(2);
            }
        }
    });
    
    // Auto-resize description field if needed
    const descriptionField = document.getElementById('description');
    descriptionField.addEventListener('input', () => {
        if (descriptionField.value.length > 50) {
            descriptionField.style.height = 'auto';
            descriptionField.style.height = descriptionField.scrollHeight + 'px';
        }
    });
});