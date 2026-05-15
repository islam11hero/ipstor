"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import { approveDeposit, fulfillOrder } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PendingDeposit, PendingOrder } from "@/lib/types/admin";

type AdminPanelProps = {
  deposits: PendingDeposit[];
  orders: PendingOrder[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function shortId(id: string) {
  return `${id.slice(0, 8)}…`;
}

export function AdminPanel({ deposits, orders }: AdminPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fulfillOrderId, setFulfillOrderId] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function refresh() {
    router.refresh();
  }

  function handleApprove(depositId: string) {
    startTransition(async () => {
      const result = await approveDeposit(depositId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Deposit approved and balance updated.");
      refresh();
    });
  }

  function openFulfillDialog(orderId: string) {
    setFulfillOrderId(orderId);
    setIpAddress("");
    setPort("");
    setUsername("");
    setPassword("");
  }

  function closeFulfillDialog() {
    setFulfillOrderId(null);
  }

  function handleFulfillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fulfillOrderId) return;

    startTransition(async () => {
      const result = await fulfillOrder({
        orderId: fulfillOrderId,
        ipAddress,
        port,
        username,
        password,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Order fulfilled and proxy credentials saved.");
      closeFulfillDialog();
      refresh();
    });
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
          <Shield className="size-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Approve deposits and fulfill proxy orders.
          </p>
        </div>
      </div>

      <Tabs defaultValue="deposits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deposits">
            Pending Deposits
            {deposits.length > 0 && (
              <span className="ml-1.5 rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                {deposits.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders">
            Pending Orders
            {orders.length > 0 && (
              <span className="ml-1.5 rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <div className="rounded-xl border border-white/10 bg-card/50">
            {deposits.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">
                No pending deposits.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>User ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>TXID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow
                      key={deposit.id}
                      className="border-white/5 hover:bg-white/[0.02]"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {deposit.user_email ?? shortId(deposit.user_id)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {shortId(deposit.user_id)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(deposit.amount)}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">
                        {deposit.txid}
                      </TableCell>
                      <TableCell>{formatDate(deposit.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-cyan-500 text-black hover:bg-cyan-400"
                          disabled={isPending}
                          onClick={() => handleApprove(deposit.id)}
                        >
                          {isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="rounded-xl border border-white/10 bg-card/50">
            {orders.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">
                No pending orders.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Proxy Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-white/5 hover:bg-white/[0.02]"
                    >
                      <TableCell className="font-mono text-xs">
                        {shortId(order.id)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {order.proxy_type}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        {formatCurrency(order.total_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-500/30 hover:bg-cyan-500/10"
                          disabled={isPending}
                          onClick={() => openFulfillDialog(order.id)}
                        >
                          Fulfill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={fulfillOrderId !== null}
        onOpenChange={(open) => !open && closeFulfillDialog()}
      >
        <DialogContent className="border-white/10 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fulfill order</DialogTitle>
            <DialogDescription>
              Enter proxy credentials to deliver to the customer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFulfillSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-address">IP Address</Label>
              <Input
                id="ip-address"
                placeholder="192.168.1.1"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="proxy_user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="border-0 bg-transparent p-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeFulfillDialog}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 text-black hover:bg-cyan-400"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Submit & complete"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
