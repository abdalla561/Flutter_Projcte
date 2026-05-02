import React, { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  Truck, 
  ChevronDown, 
  ChevronUp,
  Search,
  ExternalLink,
  Loader2
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/Table"
import { ordersService } from "../services/api"

const OrderRow = ({ order, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false)

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'accepted': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-indigo-100 text-indigo-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
        <TableCell>{order.profiles?.name || "Unknown Customer"}</TableCell>
        <TableCell>${order.total_amount}</TableCell>
        <TableCell>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {order.status === 'pending' && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-green-600" 
                  onClick={() => onUpdateStatus(order.id, 'accepted')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-600"
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {order.status === 'accepted' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-blue-600"
                onClick={() => onUpdateStatus(order.id, 'shipped')}
              >
                <Truck className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6} className="p-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Order Items</h4>
              <div className="space-y-2">
                {order.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-dashed pb-2">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">IMG</div>
                      <div>
                        <p className="font-medium">{item.products?.name || "Product"}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    {/* Price is usually in order_items or calculated, but let's just show qty for now if price isn't there */}
                    <p className="font-mono">x{item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3 w-3" />
                  View Details
                </Button>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">${order.total_amount}</p>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getAll()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (id, status) => {
    try {
      await ordersService.updateStatus(id, status)
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    } catch (error) {
      alert("Error updating order: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Monitor and fulfill customer orders</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="relative w-full md:w-96">
            <label htmlFor="searchOrders" className="sr-only">Search orders</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="searchOrders"
              name="searchOrders"
              placeholder="Search orders by ID or customer..." 
              className="pl-10" 
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <OrderRow 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default Orders
