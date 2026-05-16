import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class MedicineBillServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        try {
            String name = request.getParameter("name");
            String priceParam = request.getParameter("price");
            String qtyParam = request.getParameter("qty");

            if (name == null || name.isEmpty() ||
                priceParam == null || priceParam.isEmpty() ||
                qtyParam == null || qtyParam.isEmpty()) {
                out.println("<!DOCTYPE html>");
                out.println("<html><body>");
                out.println("<h2>Error: All fields are required</h2>");
                out.println("<a href='index.html'>Go Back</a>");
                out.println("</body></html>");
                return;
            }

            double price = Double.parseDouble(priceParam);
            int qty = Integer.parseInt(qtyParam);

            if (price <= 0 || qty <= 0) {
                out.println("<!DOCTYPE html>");
                out.println("<html><body>");
                out.println("<h2>Error: Price and quantity must be positive values</h2>");
                out.println("<a href='index.html'>Go Back</a>");
                out.println("</body></html>");
                return;
            }

            double total = price * qty;

            out.println("<!DOCTYPE html>");
            out.println("<html><head><title>Medicine Bill</title></head><body>");
            out.println("<h2>Medicine Bill Receipt</h2>");
            out.println("<table border='1' cellpadding='8'>");
            out.println("<tr><th>Medicine</th><td>" + name + "</td></tr>");
            out.println("<tr><th>Price/Unit</th><td>&#8377; " + String.format("%.2f", price) + "</td></tr>");
            out.println("<tr><th>Quantity</th><td>" + qty + "</td></tr>");
            out.println("<tr><th>Total Amount</th><td><b>&#8377; " + String.format("%.2f", total) + "</b></td></tr>");
            out.println("</table>");
            out.println("<br><a href='index.html'>Back</a>");
            out.println("</body></html>");

        } catch (NumberFormatException e) {
            out.println("<!DOCTYPE html>");
            out.println("<html><body>");
            out.println("<h2>Error: Please enter valid numeric values</h2>");
            out.println("<a href='index.html'>Go Back</a>");
            out.println("</body></html>");
        } finally {
            out.close();
        }
    }
}
